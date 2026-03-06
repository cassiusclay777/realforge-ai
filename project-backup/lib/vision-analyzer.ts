import OpenAI from 'openai';
import fs from 'fs/promises';

export interface PhotoAnalysis {
  roomType: 'KITCHEN' | 'BATHROOM' | 'BEDROOM' | 'LIVING_ROOM' | 'HALLWAY' | 'FACADE' | 'EXTERIOR' | 'GARDEN' | 'OTHER';
  quality: 'EXCELLENT' | 'GOOD' | 'POOR' | 'BLURRY' | 'TOO_DARK' | 'TOO_BRIGHT';
  description: string;  // popis co je na fotce
  suggestedCaption: string;  // popisek pro realitní web
  saliencyScore: number;  // 0-100 jak je důležitá
  recommendedForMain: boolean;  // doporučit jako hlavní?
}

export class VisionAnalyzer {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.deepseek.com/v1',
    });
  }

  async analyzePhoto(imagePath: string): Promise<PhotoAnalysis> {
    try {
      // Načti obrázek jako base64
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');

      const response = await this.openai.chat.completions.create({
        model: 'deepseek-vision',
        messages: [
          {
            role: 'system',
            content: `Jsi expert na realitní fotografie. Analyzuj fotku nemovitosti a vrať JSON:
            {
              "roomType": "KITCHEN | BATHROOM | BEDROOM | LIVING_ROOM | HALLWAY | FACADE | EXTERIOR | GARDEN | OTHER",
              "quality": "EXCELLENT | GOOD | POOR | BLURRY | TOO_DARK | TOO_BRIGHT",
              "description": "co je na fotce (česky, 1 věta)",
              "suggestedCaption": "popisek pro realitní web (max 100 znaků, česky)",
              "saliencyScore": 0-100,
              "recommendedForMain": true/false
            }
            
            PRAVIDLA PRO KLASIFIKACI:
            1. KITCHEN - kuchyň s linkou, sporákem, dřezem, lednicí
            2. BATHROOM - koupelna s vanou, sprchou, umyvadlem, toaletou
            3. BEDROOM - ložnice s postelí, nočními stolky, skříní
            4. LIVING_ROOM - obývák s pohovkou, křesly, TV, stolem
            5. HALLWAY - chodba, předsíň, schodiště uvnitř budovy
            6. FACADE - přední nebo boční pohled na budovu zvenku
            7. EXTERIOR - venkovní prostory kolem domu (kromě zahrady)
            8. GARDEN - zahrada, trávník, záhony, stromy, venkovní posezení
            9. OTHER - cokoliv jiného
            
            Pokud je fotka pořízená z výšky (pohled shora) a ukazuje venkovní prostory s trávou, stromy nebo záhony, použij GARDEN.
            Pokud je fotka interiéru (uvnitř budovy), vyber příslušnou místnost.
            Pokud je fotka exteriéru (venku) ale ne zahrada, použij EXTERIOR nebo FACADE.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        roomType: analysis.roomType || 'OTHER',
        quality: analysis.quality || 'GOOD',
        description: analysis.description || '',
        suggestedCaption: analysis.suggestedCaption || '',
        saliencyScore: analysis.saliencyScore || 50,
        recommendedForMain: analysis.recommendedForMain || false,
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
}