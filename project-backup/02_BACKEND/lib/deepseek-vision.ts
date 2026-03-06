import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';

export interface PhotoAnalysis {
  roomType: 'KITCHEN' | 'BATHROOM' | 'BEDROOM' | 'LIVING_ROOM' | 'HALLWAY' | 'FACADE' | 'EXTERIOR' | 'OTHER';
  quality: 'EXCELLENT' | 'GOOD' | 'POOR' | 'BLURRY' | 'TOO_DARK' | 'TOO_BRIGHT';
  isDuplicate: boolean;
  duplicateOf?: string;
  hasPeople: boolean;
  saliencyScore: number; // 0-100 jak je fotka důležitá
  recommendedForMain: boolean;
  description: string; // co je na fotce
  suggestedCaption: string; // návrh popisku pro tuto fotku
}

export interface ListingAnalysisResult {
  photos: {
    path: string;
    analysis: PhotoAnalysis;
    recommendedOrder: number;
  }[];
  filteredPhotos: string[]; // cesty k fotkám co ponechat
  mainPhoto: string; // cesta k hlavní fotce
  roomStats: {
    [key: string]: number; // počet fotek podle místností
  };
  generatedTitle: string;
  generatedDescription: string;
  shortDescription: string; // pro Sreality (250 znaků)
  seoTitle: string;
  seoDescription: string;
  suggestedPrice?: number;
  estimatedValue?: string;
  targetAudience: string;
  bestPublishingTime: string;
}

export class DeepSeekVision {
  private openai: OpenAI;
  private model = 'deepseek-chat'; // DeepSeek podporuje vision přes tento model

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.deepseek.com/v1',
    });
  }

  /**
   * Analyzuje jednu fotku pomocí DeepSeek Vision
   */
  async analyzePhoto(imagePath: string, allPhotos: string[] = []): Promise<PhotoAnalysis> {
    try {
      // Načtení obrázku jako base64
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');
      
      // Detekce duplicit (porovnání s ostatními fotkami)
      const duplicateCheck = allPhotos.length > 1 
        ? await this.checkForDuplicates(imagePath, allPhotos)
        : { isDuplicate: false, duplicateOf: undefined };

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `Jsi expert na realitní fotografie. Analyzuj fotku nemovitosti a vrať JSON s:
            - roomType: typ místnosti (KITCHEN, BATHROOM, BEDROOM, LIVING_ROOM, HALLWAY, FACADE, EXTERIOR, OTHER)
            - quality: kvalita foky (EXCELLENT, GOOD, POOR, BLURRY, TOO_DARK, TOO_BRIGHT)
            - hasPeople: jestli jsou na fotce lidé (true/false)
            - saliencyScore: 0-100 jak je fotka důležitá pro inzerát
            - recommendedForMain: jestli by mohla být hlavní fotka (true/false)
            - description: stručný popis co je na fotce (česky)
            - suggestedCaption: návrh popisku pro realitní web (max 100 znaků, česky)`
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
        max_tokens: 1000,
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        roomType: analysis.roomType || 'OTHER',
        quality: analysis.quality || 'GOOD',
        isDuplicate: duplicateCheck.isDuplicate,
        duplicateOf: duplicateCheck.duplicateOf,
        hasPeople: analysis.hasPeople || false,
        saliencyScore: analysis.saliencyScore || 50,
        recommendedForMain: analysis.recommendedForMain || false,
        description: analysis.description || '',
        suggestedCaption: analysis.suggestedCaption || '',
      };
    } catch (error) {
      console.error(`Chyba při analýze fotky ${imagePath}:`, error);
      return {
        roomType: 'OTHER',
        quality: 'POOR',
        isDuplicate: false,
        hasPeople: false,
        saliencyScore: 0,
        recommendedForMain: false,
        description: 'Nepodařilo se analyzovat',
        suggestedCaption: '',
      };
    }
  }

  /**
   * Kontrola duplicitních fotek
   */
  private async checkForDuplicates(imagePath: string, allPhotos: string[]): Promise<{ isDuplicate: boolean; duplicateOf?: string }> {
    // TODO: Implementovat perceptuální hash pro detekci duplicit
    // Prozatím jednoduchá kontrola
    return { isDuplicate: false };
  }

  /**
   * Generuje kompletní popis nemovitosti z fotek a uživatelského vstupu
   */
  async generateListingDescription(
    photoAnalyses: PhotoAnalysis[],
    userDescription: string,
    propertyType?: string,
    location?: string,
    price?: number
  ): Promise<{
    title: string;
    description: string;
    shortDescription: string;
    seoTitle: string;
    seoDescription: string;
    targetAudience: string;
    suggestedPrice?: number;
  }> {
    
    // Statistiky místností
    const roomStats = photoAnalyses.reduce((acc, p) => {
      acc[p.roomType] = (acc[p.roomType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const roomList = Object.entries(roomStats)
      .map(([room, count]) => `${count}x ${this.translateRoom(room)}`)
      .join(', ');

    const qualitySummary = {
      excellent: photoAnalyses.filter(p => p.quality === 'EXCELLENT').length,
      good: photoAnalyses.filter(p => p.quality === 'GOOD').length,
      poor: photoAnalyses.filter(p => p.quality === 'POOR').length,
    };

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: `Jsi profesionální realitní makléř a copywriter. Na základě analýzy fotek a popisu od klienta vytvoř prodejní texty.
          Vrať JSON s:
          - title: poutavý nadpis (max 60 znaků)
          - description: dlouhý popis (3-4 odstavce)
          - shortDescription: krátký popis pro Sreality (max 250 znaků)
          - seoTitle: SEO titulek (max 60 znaků)
          - seoDescription: SEO popis (max 160 znaků)
          - targetAudience: pro koho je nemovitost vhodná (rodiny, investory, studenty...)
          - suggestedPrice: doporučená cena (pokud není zadaná)`
        },
        {
          role: 'user',
          content: `
          Uživatelský popis: "${userDescription}"
          ${propertyType ? `Typ: ${propertyType}` : ''}
          ${location ? `Lokalita: ${location}` : ''}
          ${price ? `Zadaná cena: ${price} Kč` : ''}
          
          Analýza fotek:
          - Celkem fotek: ${photoAnalyses.length}
          - Místnosti: ${roomList}
          - Kvalita: ${qualitySummary.excellent} výborných, ${qualitySummary.good} dobrých, ${qualitySummary.poor} špatných
          
          Popisy jednotlivých fotek:
          ${photoAnalyses.map((p, i) => `Fotka ${i+1} (${this.translateRoom(p.roomType)}): ${p.description}`).join('\n')}
          `
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  private translateRoom(room: string): string {
    const translations: Record<string, string> = {
      'KITCHEN': 'kuchyň',
      'BATHROOM': 'koupelna',
      'BEDROOM': 'ložnice',
      'LIVING_ROOM': 'obývák',
      'HALLWAY': 'chodba',
      'FACADE': 'fasáda',
      'EXTERIOR': 'exteriér',
      'OTHER': 'ostatní'
    };
    return translations[room] || room.toLowerCase();
  }

  /**
   * Kompletní analýza všech fotek v adresáři
   */
  async analyzeListingPhotos(
    photoDirectory: string,
    userDescription: string,
    options?: {
      propertyType?: string;
      location?: string;
      price?: number;
    }
  ): Promise<ListingAnalysisResult> {
    // Načtení všech fotek
    const files = await fs.readdir(photoDirectory);
    const photoPaths = files
      .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
      .map(f => path.join(photoDirectory, f));

    console.log(`🔍 Analyzuji ${photoPaths.length} fotek...`);

    // Analýza každé fotky
    const analyses: { path: string; analysis: PhotoAnalysis }[] = [];
    for (const photoPath of photoPaths) {
      const analysis = await this.analyzePhoto(photoPath, photoPaths);
      analyses.push({ path: photoPath, analysis });
    }

    // Filtrování špatných fotek a duplicit
    const filteredPhotos = analyses
      .filter(a => 
        a.analysis.quality !== 'BLURRY' && 
        a.analysis.quality !== 'POOR' && 
        !a.analysis.isDuplicate &&
        !a.analysis.hasPeople // Fotky s lidmi nechceme v inzerátu
      )
      .sort((a, b) => b.analysis.saliencyScore - a.analysis.saliencyScore);

    // Hlavní fotka (nejvyšší saliency nebo doporučená)
    const mainPhoto = filteredPhotos[0]?.path || photoPaths[0];

    // Statistiky místností
    const roomStats = analyses.reduce((acc, a) => {
      acc[a.analysis.roomType] = (acc[a.analysis.roomType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Generování popisků
    const texts = await this.generateListingDescription(
      analyses.map(a => a.analysis),
      userDescription,
      options?.propertyType,
      options?.location,
      options?.price
    );

    // Seřazení fotek pro galerii (podle místností)
    const orderPriority: Record<string, number> = {
      'FACADE': 1,
      'LIVING_ROOM': 2,
      'KITCHEN': 3,
      'BEDROOM': 4,
      'BATHROOM': 5,
      'HALLWAY': 6,
      'EXTERIOR': 7,
      'OTHER': 8
    };

    const sortedAnalyses = filteredPhotos.sort((a, b) => {
      const orderA = orderPriority[a.analysis.roomType] || 99;
      const orderB = orderPriority[b.analysis.roomType] || 99;
      if (orderA !== orderB) return orderA - orderB;
      return b.analysis.saliencyScore - a.analysis.saliencyScore;
    });

    return {
      photos: sortedAnalyses,
      filteredPhotos: sortedAnalyses.map(a => a.path),
      mainPhoto: mainPhoto,
      roomStats,
      generatedTitle: texts.title,
      generatedDescription: texts.description,
      shortDescription: texts.shortDescription,
      seoTitle: texts.seoTitle,
      seoDescription: texts.seoDescription,
      suggestedPrice: texts.suggestedPrice,
      targetAudience: texts.targetAudience,
      bestPublishingTime: 'Čt 10:00', // TODO: AI predikce
    };
  }
}
