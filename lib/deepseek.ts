import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';

const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? 'deepseek-chat';
const DEEPSEEK_BASE = (process.env.DEEPSEEK_API_URL ?? 'https://api.deepseek.com').replace(/\/$/, '');

export const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: DEEPSEEK_BASE,
});

export interface DeepSeekImageAnalysis {
  description: string;
  categories: string[];
  tags: string[];
  saliencyScore: number;
  suggestedHeadline?: string;
  suggestedDescription?: string;
}

export interface DeepSeekContentGeneration {
  headline: string;
  shortDesc: string;
  longDesc: string;
  bulletPoints: string[];
  seoTitle: string;
  seoDescription: string;
  priceSuggestion: number;
  priceReasoning: string;
  targetAudience: string;
  recommendations: string[];
  instagramCaption: string;
  fbPost: string;
  bestTimeToPost: string;
}

function getClient(apiKey?: string | null): OpenAI {
  if (apiKey) {
    return new OpenAI({ apiKey, baseURL: DEEPSEEK_BASE });
  }
  return deepseek;
}

/**
 * Načte obrázek jako base64 – zvládá lokální cesty i http/https URL.
 */
async function imageToBase64(imageUrl: string): Promise<string | null> {
  try {
    if (imageUrl.startsWith('/')) {
      const localPath = path.join(process.cwd(), 'public', imageUrl);
      const buf = await fs.readFile(localPath);
      return buf.toString('base64');
    }
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      const res = await fetch(imageUrl, { signal: AbortSignal.timeout(8_000) });
      if (!res.ok) return null;
      const buf = await res.arrayBuffer();
      return Buffer.from(buf).toString('base64');
    }
  } catch {
    // Obrázek nelze načíst – nevadí, pokračujeme bez něj
  }
  return null;
}

/**
 * Analyzuje fotografii nemovitosti přes DeepSeek Vision.
 * Funguje pro lokální cesty (/uploads/…) i pro http URL.
 */
export async function analyzeImageWithDeepSeek(
  imageUrl: string,
  context?: string,
  options?: { apiKey?: string | null }
): Promise<DeepSeekImageAnalysis> {
  const client = getClient(options?.apiKey);

  const base64 = await imageToBase64(imageUrl);

  if (base64) {
    try {
      const response = await client.chat.completions.create({
        model: DEEPSEEK_MODEL,
        messages: [
          {
            role: 'system',
            content: 'Jsi expert na realitní fotografie. Analyzuj přiloženou fotografii a vrať pouze validní JSON, žádný jiný text.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${base64}` },
              },
              {
                type: 'text',
                text: `Analyzuj tuto fotografii nemovitosti${context ? ` (kontext: ${context})` : ''} a vrať JSON:
{
  "description": "konkrétní popis toho, co vidíš – místnost, vybavení, stav, světlo (2-3 věty)",
  "categories": ["jedna z: LIVING_ROOM, KITCHEN, BEDROOM, BATHROOM, HALLWAY, FACADE, EXTERIOR, GARDEN, OTHER"],
  "tags": ["3-5 konkrétních tagů v češtině, např. dřevěná podlaha, vstavaná skříň"],
  "saliencyScore": 0.0–1.0,
  "suggestedHeadline": "krátký titulek max 60 znaků",
  "suggestedDescription": "popisek pro inzerát max 120 znaků"
}`,
              },
            ],
          },
        ],
        max_tokens: 600,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('Prázdná odpověď');
      const parsed = JSON.parse(content) as Partial<DeepSeekImageAnalysis>;
      return {
        description: parsed.description ?? 'Fotografie nemovitosti',
        categories: Array.isArray(parsed.categories) ? parsed.categories : ['OTHER'],
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        saliencyScore: Math.min(1, Math.max(0, Number(parsed.saliencyScore) || 0.6)),
        suggestedHeadline: parsed.suggestedHeadline,
        suggestedDescription: parsed.suggestedDescription,
      };
    } catch (err) {
      console.error('DeepSeek vision analysis failed:', err);
    }
  }

  // Fallback – bez obrázku, model alespoň zná URL kontext
  return {
    description: `Fotografie nemovitosti${context ? ` – ${context}` : ''}`,
    categories: ['OTHER'],
    tags: ['nemovitost'],
    saliencyScore: 0.5,
  };
}

/**
 * Generuje kompletní marketingový obsah pro inzerát nemovitosti.
 * Jádro AI pipeline – volá DeepSeek text model.
 */
export async function generateContentWithDeepSeek(
  imageAnalyses: DeepSeekImageAnalysis[],
  propertyDetails: {
    title?: string;
    address?: string;
    type?: string;
    price?: number;
    area?: number;
    rooms?: number;
    userDescription?: string;
  },
  options?: { apiKey?: string | null }
): Promise<DeepSeekContentGeneration> {
  const client = getClient(options?.apiKey);

  const typeLabel: Record<string, string> = {
    APARTMENT: 'Byt',
    HOUSE: 'Rodinný dům',
    LAND: 'Pozemek',
  };
  const typeCZ = typeLabel[propertyDetails.type ?? ''] ?? propertyDetails.type ?? 'Nemovitost';

  const photoSummary = imageAnalyses.length > 0
    ? imageAnalyses.map((a, i) => `Foto ${i + 1}: ${a.description}${a.tags?.length ? ` [${a.tags.join(', ')}]` : ''}`).join('\n')
    : 'Fotografie nejsou k dispozici.';

  const userDescSection = propertyDetails.userDescription
    ? `\nPOPIS OD MAKLÉŘE (priority – toto jsou ověřené informace, zahrň je do textu):\n"${propertyDetails.userDescription}"\n`
    : '';

  const systemPrompt = `Jsi zkušený copywriter specialista na český realitní trh. Píšeš texty pro portály Sreality.cz, Bezrealitky.cz a sociální sítě. Tvůj styl je profesionální, konkrétní a přesvědčivý – žádné prázdné fráze. Každý text musí být unikátní a odpovídat skutečným parametrům nemovitosti.`;

  const userPrompt = `Vygeneruj kompletní marketingový obsah pro tuto nemovitost:

PARAMETRY:
- Typ: ${typeCZ}
- Název: ${propertyDetails.title ?? 'neuvedeno'}
- Adresa/lokalita: ${propertyDetails.address ?? 'neuvedeno'}
- Cena: ${propertyDetails.price ? `${propertyDetails.price.toLocaleString('cs-CZ')} Kč` : 'neuvedeno'}
- Plocha: ${propertyDetails.area ? `${propertyDetails.area} m²` : 'neuvedena'}
- Počet pokojů: ${propertyDetails.rooms ?? 'neuvedeno'}

${userDescSection}
ANALÝZA FOTOGRAFIÍ:
${photoSummary}

Vrať POUZE validní JSON (bez markdown, bez komentářů):
{
  "headline": "atraktivní titulek inzerátu max 65 znaků, formát např. 'Prostorný byt 3+kk s balkónem | Praha 5-Smíchov'",
  "shortDesc": "2 věty, klíčové výhody, max 200 znaků – pro náhled na portálu",
  "longDesc": "3-5 vět, profesionální popis pro portál – konkrétní, bez klišé. Zmiň dispozici, stav, lokalitu, výhody.",
  "bulletPoints": ["4-5 konkrétních výhod, každá max 60 znaků, např. 'Nová koupelna s podlahovým topením'"],
  "seoTitle": "SEO titulek max 60 znaků s klíčovými slovy (typ, dispozice, lokalita)",
  "seoDescription": "SEO popis max 155 znaků s výzvou k akci",
  "priceSuggestion": číslo (Kč) – tržní odhad ceny na základě parametrů a průměrů v dané lokalitě,
  "priceReasoning": "1-2 věty vysvětlující odhad ceny ve srovnání s trhem",
  "targetAudience": "přesná cílová skupina, např. 'Mladé páry a single profesionálové hledající první vlastní bydlení'",
  "recommendations": ["3-4 konkrétní doporučení pro marketing, např. 'Zveřejnit ve čtvrtek dopoledne – nejvyšší traffic na Sreality'"],
  "instagramCaption": "Instagram post max 220 znaků – casual tón, 3-4 relevantní hashtagy v češtině",
  "fbPost": "Facebook post 2-3 věty – profesionálnější tón, výzva k prohlídce nebo kontaktu",
  "bestTimeToPost": "nejlepší čas publikování pro max dosah (den + hodina + proč)"
}`;

  try {
    const response = await client.chat.completions.create({
      model: DEEPSEEK_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 2500,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Prázdná odpověď z DeepSeek');
    const parsed = JSON.parse(content) as Partial<DeepSeekContentGeneration>;

    return {
      headline: parsed.headline ?? `${typeCZ} – ${propertyDetails.address ?? 'Nemovitost'}`,
      shortDesc: parsed.shortDesc ?? '',
      longDesc: parsed.longDesc ?? '',
      bulletPoints: Array.isArray(parsed.bulletPoints) ? parsed.bulletPoints : [],
      seoTitle: parsed.seoTitle ?? parsed.headline ?? '',
      seoDescription: parsed.seoDescription ?? '',
      priceSuggestion: Math.max(0, Number(parsed.priceSuggestion) || propertyDetails.price || 0),
      priceReasoning: parsed.priceReasoning ?? '',
      targetAudience: parsed.targetAudience ?? '',
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      instagramCaption: parsed.instagramCaption ?? '',
      fbPost: parsed.fbPost ?? '',
      bestTimeToPost: parsed.bestTimeToPost ?? 'Čtvrtek 10:00 – nejvyšší aktivita uživatelů na realitních portálech',
    };
  } catch (error) {
    console.error('DeepSeek content generation error:', error);
    throw new Error(
      `Generování obsahu selhalo: ${error instanceof Error ? error.message : 'Neznámá chyba'}. Zkontroluj platnost DEEPSEEK_API_KEY.`
    );
  }
}

export async function checkDeepSeekHealth(): Promise<boolean> {
  try {
    await deepseek.models.list();
    return true;
  } catch {
    return false;
  }
}
