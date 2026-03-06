import OpenAI from 'openai';
import dotenv from 'dotenv';

// Načti environment proměnné z .env.local
dotenv.config({ path: '.env.local' });

// DeepSeek API je kompatibilní s OpenAI SDK
export const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com',
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

export async function analyzeImageWithDeepSeek(
  imageUrl: string,
  context?: string,
  options?: { apiKey?: string }
): Promise<DeepSeekImageAnalysis> {
  const client = getClient(options?.apiKey);
  try {
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `Jsi expert na realitní fotografie. Na základě URL obrázku nemovitosti poskytni detailní analýzu.
          Vrať odpověď jako JSON s následujícími poli:
          - description: detailní popis toho, co by na obrázku nemovitosti mohlo být
          - categories: pole kategorií (např. ["LIVING_ROOM", "KITCHEN", "BEDROOM", "BATHROOM", "FACADE", "ADVERTISEMENT"])
          - tags: pole tagů (např. ["modern", "bright", "spacious", "renovated"])
          - saliencyScore: číslo 0-1 (důležitost obrázku)
          - suggestedHeadline: návrh titulku pro tento obrázek
          - suggestedDescription: návrh popisu pro tento obrázek`
        },
        {
          role: 'user',
          content: `Analyzuj obrázek nemovitosti na této URL: ${imageUrl}. ${context ? `Kontext: ${context}` : ''}`
        }
      ],
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from DeepSeek API');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('DeepSeek image analysis error:', error);
    // Fallback na simulovanou analýzu
    return {
      description: `Obrázek nemovitosti na URL: ${imageUrl}`,
      categories: ['LIVING_ROOM', 'KITCHEN', 'BEDROOM'][Math.floor(Math.random() * 3)] as any,
      tags: ['modern', 'bright', 'spacious'],
      saliencyScore: 0.7 + Math.random() * 0.3,
      suggestedHeadline: 'Moderní nemovitost',
      suggestedDescription: 'Kvalitní fotografie nemovitosti'
    };
  }
}

function getClient(apiKey?: string): OpenAI {
  if (apiKey) {
    return new OpenAI({
      apiKey,
      baseURL: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com',
    });
  }
  return deepseek;
}

export async function generateContentWithDeepSeek(
  imageAnalyses: DeepSeekImageAnalysis[],
  propertyDetails: {
    title?: string;
    address?: string;
    type?: string;
    price?: number;
    area?: number;
    rooms?: number;
  },
  options?: { apiKey?: string }
): Promise<DeepSeekContentGeneration> {
  const client = getClient(options?.apiKey);
  try {
    const systemPrompt = `Jsi expert na realitní marketing. Na základě analýzy fotografií nemovitosti vygeneruj profesionální marketingový obsah.
    
Vlastnosti nemovitosti:
- Název: ${propertyDetails.title || 'Neuvedeno'}
- Adresa: ${propertyDetails.address || 'Neuvedeno'}
- Typ: ${propertyDetails.type || 'Neuvedeno'}
- Cena: ${propertyDetails.price ? `${propertyDetails.price.toLocaleString('cs-CZ')} CZK` : 'Neuvedeno'}
- Plocha: ${propertyDetails.area ? `${propertyDetails.area} m²` : 'Neuvedeno'}
- Pokojů: ${propertyDetails.rooms || 'Neuvedeno'}

Vrať odpověď jako JSON s následujícími poli:
- headline: atraktivní titulek (max 60 znaků)
- shortDesc: krátký popis (1-2 věty)
- longDesc: dlouhý popis (3-5 vět)
- bulletPoints: pole 3-5 výhod
- seoTitle: SEO optimalizovaný titulek (max 60 znaků)
- seoDescription: SEO popis (max 160 znaků)
- priceSuggestion: návrh ceny (číslo)
- priceReasoning: zdůvodnění ceny
- targetAudience: cílová skupina
- recommendations: pole doporučení pro marketing
- instagramCaption: popisek pro Instagram
- fbPost: příspěvek pro Facebook
- bestTimeToPost: nejlepší čas pro publikování`;

    const userPrompt = `Analýza fotografií nemovitosti:\n${imageAnalyses.map((analysis, i) => 
      `Foto ${i + 1}: ${analysis.description}\nKategorie: ${analysis.categories.join(', ')}\nTagy: ${analysis.tags.join(', ')}`
    ).join('\n\n')}`;

    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from DeepSeek API');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('DeepSeek content generation error:', error);
    // Fallback na simulovaný obsah
    return {
      headline: `Moderní nemovitost v ${propertyDetails.title || 'Brně'}`,
      shortDesc: 'Skvělá příležitost pro investici nebo bydlení.',
      longDesc: 'Tato nemovitost nabízí moderní vybavení, skvělou polohu a výborný potenciál pro zhodnocení.',
      bulletPoints: ['Moderní vybavení', 'Dobrá dopravní dostupnost', 'Klidná lokalita'],
      seoTitle: 'Moderní nemovitost k prodeji',
      seoDescription: 'Prodej moderní nemovitosti s velkým potenciálem.',
      priceSuggestion: propertyDetails.price ? propertyDetails.price * 1.1 : 9500000,
      priceReasoning: 'Cena odpovídá tržní hodnotě a kvalitě nemovitosti.',
      targetAudience: 'Mladé páry, investoři, rodiny',
      recommendations: ['Zveřejnit na Sreality.cz', 'Sdílet na sociálních sítích'],
      instagramCaption: 'Objevte tuto skvělou nemovitost! #realestate',
      fbPost: 'Nová nemovitost právě přidána na náš portál.',
      bestTimeToPost: 'Pátek odpoledne'
    };
  }
}

export async function checkDeepSeekHealth(): Promise<boolean> {
  try {
    await deepseek.models.list();
    return true;
  } catch (error) {
    console.error('DeepSeek health check failed:', error);
    return false;
  }
}