import fs from 'fs/promises';
import { analyzeImageForZip } from './deepseek-vision';

export interface PhotoAnalysis {
  roomType: 'KITCHEN' | 'BATHROOM' | 'BEDROOM' | 'LIVING_ROOM' | 'HALLWAY' | 'FACADE' | 'EXTERIOR' | 'GARDEN' | 'OTHER';
  quality: 'EXCELLENT' | 'GOOD' | 'POOR' | 'BLURRY' | 'TOO_DARK' | 'TOO_BRIGHT';
  description: string;
  suggestedCaption: string;
  saliencyScore: number;
  recommendedForMain: boolean;
}

const KATEGORIE_TO_ROOM: Record<string, PhotoAnalysis['roomType']> = {
  kuchyň: 'KITCHEN',
  obývák: 'LIVING_ROOM',
  ložnice: 'BEDROOM',
  koupelna: 'BATHROOM',
  exteriér: 'EXTERIOR',
  zahrada: 'GARDEN',
  garáž: 'OTHER',
  chodba: 'HALLWAY',
  pracovna: 'OTHER',
  ostatní: 'OTHER',
  facade: 'FACADE',
  fasáda: 'FACADE',
};

const SYSTEM_PROMPT = `Jsi expert na realitní fotografie. Analyzuj fotku nemovitosti a vrať pouze validní JSON (žádný jiný text):
{
  "roomType": "KITCHEN | BATHROOM | BEDROOM | LIVING_ROOM | HALLWAY | FACADE | EXTERIOR | GARDEN | OTHER",
  "quality": "EXCELLENT | GOOD | POOR | BLURRY | TOO_DARK | TOO_BRIGHT",
  "description": "co je na fotce (česky, 1–2 věty)",
  "suggestedCaption": "popisek pro realitní web (max 100 znaků, česky, atraktivní)",
  "saliencyScore": 0-100,
  "recommendedForMain": true nebo false
}

PRAVIDLA: KITCHEN=kuchyň, BATHROOM=koupelna, BEDROOM=ložnice, LIVING_ROOM=obývák, HALLWAY=chodba, FACADE=fasáda, EXTERIOR=exteriér, GARDEN=zahrada, OTHER=ostatní. Popis i suggestedCaption piš konkrétně podle obsahu fotky.`;

const PROPERTY_CLASSIFY_PROMPT = `Jsi expert na nemovitosti. Z této fotky nemovitosti urči a vrať pouze validní JSON (žádný jiný text):
{
  "type": "APARTMENT | HOUSE | LAND",
  "title": "krátký atraktivní název inzerátu v češtině, max 80 znaků (např. Byt 3+1 s balkonem, Praha 5)",
  "price": číslo odhadu ceny v Kč z fotky, nebo 0 pokud nelze odhadnout
}

PRAVIDLA: type APARTMENT = byt/apatrám, HOUSE = dům/vila/chata, LAND = pozemek. Title piš konkrétně podle toho, co na fotce vidíš (dispozice, lokace pokud je známá).`;

export interface PropertyClassification {
  type: 'APARTMENT' | 'HOUSE' | 'LAND';
  title: string;
  price: number;
}

export class VisionAnalyzer {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey: string, baseURL?: string) {
    this.apiKey = apiKey;
    this.baseURL = baseURL ?? process.env.DEEPSEEK_API_URL ?? 'https://api.deepseek.com';
  }

  async analyzePhoto(imagePath: string): Promise<PhotoAnalysis> {
    try {
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');

      if (process.env.OLLAMA_BASE_URL || process.env.OLLAMA_HOST) {
        const { kategorie, popisek } = await analyzeImageForZip(base64Image, '');
        const roomType = KATEGORIE_TO_ROOM[kategorie.toLowerCase()] ?? 'OTHER';
        return {
          roomType,
          quality: 'GOOD',
          description: popisek,
          suggestedCaption: popisek.slice(0, 100),
          saliencyScore: 50,
          recommendedForMain: false,
        };
      }

      const result = await this.callVisionApi(base64Image);
      const analysis = typeof result === 'string' ? JSON.parse(result) : result;

      return {
        roomType: this.normalizeRoomType(analysis.roomType),
        quality: analysis.quality || 'GOOD',
        description: analysis.description || '',
        suggestedCaption: analysis.suggestedCaption || '',
        saliencyScore: Math.min(100, Math.max(0, Number(analysis.saliencyScore) ?? 50)),
        recommendedForMain: Boolean(analysis.recommendedForMain),
      };
    } catch (error) {
      console.error(`Chyba při analýze fotky:`, error);
      return {
        roomType: 'OTHER',
        quality: 'GOOD',
        description: 'Nepodařilo se analyzovat',
        suggestedCaption: '',
        saliencyScore: 0,
        recommendedForMain: false,
      };
    }
  }

  private normalizeRoomType(v: unknown): PhotoAnalysis['roomType'] {
    const s = String(v ?? '').toUpperCase().replace(/-/g, '_');
    const allowed: PhotoAnalysis['roomType'][] = ['KITCHEN', 'BATHROOM', 'BEDROOM', 'LIVING_ROOM', 'HALLWAY', 'FACADE', 'EXTERIOR', 'GARDEN', 'OTHER'];
    return allowed.includes(s as PhotoAnalysis['roomType']) ? (s as PhotoAnalysis['roomType']) : 'OTHER';
  }

  /** Z jedné fotky odhadne typ nemovitosti (byt/dům/pozemek), název a volitelně cenu. Pro hromadné nahrání. */
  async classifyProperty(imagePath: string): Promise<PropertyClassification> {
    try {
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');
      const prompt = `${PROPERTY_CLASSIFY_PROMPT}\n\nVrať pouze jeden JSON objekt (žádný markdown).`;
      const result = await this.callVisionApiWithPrompt(base64Image, prompt);
      const raw = typeof result === 'string' ? JSON.parse(result) : result;
      const type = this.normalizeListingType(raw.type);
      const title = String(raw.title ?? '').trim().slice(0, 200) || 'Nemovitost';
      const price = Math.max(0, Number(raw.price) || 0);
      return { type, title, price };
    } catch (error) {
      console.error('Chyba při klasifikaci nemovitosti:', error);
      return { type: 'APARTMENT', title: 'Nemovitost', price: 0 };
    }
  }

  private normalizeListingType(v: unknown): 'APARTMENT' | 'HOUSE' | 'LAND' {
    const s = String(v ?? '').toUpperCase();
    if (s === 'HOUSE' || s === 'DŮM' || s === 'DUM') return 'HOUSE';
    if (s === 'LAND' || s === 'POZEMEK') return 'LAND';
    return 'APARTMENT';
  }

  private async callVisionApi(base64Image: string): Promise<string> {
    const prompt = `${SYSTEM_PROMPT}\n\nAnalyzuj přiloženou fotografii a vrať pouze jeden JSON objekt (žádný markdown, žádný další text).`;
    return this.callVisionApiWithPrompt(base64Image, prompt);
  }

  private async callVisionApiWithPrompt(base64Image: string, prompt: string): Promise<string> {
    const base = this.baseURL.replace(/\/$/, '');

    // Oficiální DeepSeek API: POST /v1/chat/completions (OpenAI-kompatibilní), obrázek v content jako image_url
    const body = {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system' as const,
          content: 'Jsi expert na realitní fotografie. Odpovídej vždy pouze validním JSON bez markdown.',
        },
        {
          role: 'user' as const,
          content: [
            {
              type: 'image_url' as const,
              image_url: { url: `data:image/jpeg;base64,${base64Image}` },
            },
            { type: 'text' as const, text: prompt },
          ],
        },
      ],
      max_tokens: 1000,
      response_format: { type: 'json_object' as const },
    };

    const res = await fetch(`${base}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`DeepSeek Vision API ${res.status}: ${errText}`);
    }

    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }>; output?: string; result?: string; content?: string };
    const content = data.choices?.[0]?.message?.content ?? data.output ?? data.result ?? data.content;
    if (typeof content !== 'string' || !content.trim()) throw new Error('Empty response from DeepSeek Vision');
    return content.trim();
  }
}