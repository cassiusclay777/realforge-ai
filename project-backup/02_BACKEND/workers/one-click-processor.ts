import { DeepSeekVision, ListingAnalysisResult } from '@/lib/deepseek-vision';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';
import AdmZip from 'adm-zip';
import { v4 as uuidv4 } from 'uuid';
import { publishToPoski } from '@/lib/poski';

export interface OneClickJob {
  id: string;
  zipPath: string;
  userDescription: string;
  propertyType?: string;
  location?: string;
  price?: number;
  userId: string;
  publishToPoski?: boolean; // automaticky publikovat?
}

export interface OneClickResult {
  success: boolean;
  listingId?: string;
  processedPhotos: string[];
  mainPhoto: string;
  analysis: ListingAnalysisResult;
  poskiResult?: any;
  error?: string;
}

export class OneClickProcessor {
  private deepseek: DeepSeekVision;
  private tempDir: string;
  private outputDir: string;

  constructor(apiKey: string) {
    this.deepseek = new DeepSeekVision(apiKey);
    this.tempDir = path.join(process.cwd(), 'temp', 'processing');
    this.outputDir = path.join(process.cwd(), 'public', 'processed');
  }

  /**
   * HLAVNÍ FUNKCE - JEDEN KLIK
   */
  async process(job: OneClickJob): Promise<OneClickResult> {
    const jobId = job.id || uuidv4();
    const workDir = path.join(this.tempDir, jobId);
    const extractDir = path.join(workDir, 'extracted');
    const outputZipPath = path.join(this.outputDir, `${jobId}.zip`);

    try {
      console.log(`🚀 Spouštím OneClick proces pro job ${jobId}`);
      console.log(`📝 Popis: ${job.userDescription}`);

      // 1. Vytvoření pracovního adresáře
      await fs.mkdir(extractDir, { recursive: true });

      // 2. Extrahování ZIPu
      console.log('📦 Extrahuji ZIP...');
      const zip = new AdmZip(job.zipPath);
      zip.extractAllTo(extractDir, true);

      // 3. AI analýza fotek
      console.log('🤖 AI analyzuje fotky...');
      const analysis = await this.deepseek.analyzeListingPhotos(
        extractDir,
        job.userDescription,
        {
          propertyType: job.propertyType,
          location: job.location,
          price: job.price
        }
      );

      console.log(`✅ Analýza dokončena:`);
      console.log(`   - Zachováno fotek: ${analysis.filteredPhotos.length}`);
      console.log(`   - Hlavní fotka: ${path.basename(analysis.mainPhoto)}`);
      console.log(`   - Místnosti:`, analysis.roomStats);

      // 4. Vytvoření nového ZIPu jen s kvalitními fotkami
      console.log('📦 Vytvářím finální ZIP...');
      const outputZip = new AdmZip();
      
      for (const photo of analysis.photos) {
        const fileName = path.basename(photo.path);
        outputZip.addLocalFile(photo.path, '', fileName);
      }
      
      outputZip.writeZip(outputZipPath);

      // 5. Uložení do databáze
      console.log('💾 Ukládám do databáze...');
      const listing = await prisma.listing.create({
        data: {
          title: analysis.generatedTitle,
          description: analysis.generatedDescription,
          shortDescription: analysis.shortDescription,
          price: job.price || analysis.suggestedPrice,
          address: job.location || '',
          type: job.propertyType || 'HOUSE',
          area: 0, // TODO: z analýzy nebo uživatele
          userId: job.userId,
          status: 'draft',
          metadata: {
            seoTitle: analysis.seoTitle,
            seoDescription: analysis.seoDescription,
            targetAudience: analysis.targetAudience,
            roomStats: analysis.roomStats,
            bestPublishingTime: analysis.bestPublishingTime
          }
        }
      });

      // 6. Uložení informací o zpracovaných fotkách
      await prisma.processedPhotos.create({
        data: {
          listingId: listing.id,
          categories: analysis.roomStats,
          outputZipUrl: `/processed/${jobId}.zip`,
          comment: job.userDescription
        }
      });

      // 7. Automatická publikace na Poski (volitelné)
      let poskiResult = null;
      if (job.publishToPoski) {
        console.log('📤 Publikuji na Poski...');
        poskiResult = await publishToPoski({
          title: analysis.generatedTitle,
          description: analysis.generatedDescription,
          price: job.price || analysis.suggestedPrice || 0,
          address: job.location || '',
          type: job.propertyType || 'HOUSE',
          area: 0,
          images: analysis.filteredPhotos
        });
      }

      // 8. Vyčištění
      await fs.rm(workDir, { recursive: true, force: true });

      console.log(`✅ HOTOVO! Listing vytvořen: ${listing.id}`);
      
      return {
        success: true,
        listingId: listing.id,
        processedPhotos: analysis.filteredPhotos,
        mainPhoto: analysis.mainPhoto,
        analysis,
        poskiResult: poskiResult || undefined
      };

    } catch (error) {
      console.error(`❌ Chyba při zpracování ${jobId}:`, error);
      
      // Vyčištění při chybě
      try {
        await fs.rm(workDir, { recursive: true, force: true });
      } catch {}
      
      return {
        success: false,
        processedPhotos: [],
        mainPhoto: '',
        analysis: {} as ListingAnalysisResult,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
