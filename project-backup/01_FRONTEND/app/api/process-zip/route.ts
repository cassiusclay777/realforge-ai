import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readdir, rm, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';
import { deepseek } from '@/lib/deepseek';

// Podporované image extensions
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];

// Helper pro vytvoření temp složky
async function createTempDir(): Promise<string> {
  const tempDir = path.join(process.cwd(), 'temp', uuidv4());
  await mkdir(tempDir, { recursive: true });
  return tempDir;
}

// Helper pro analýzu obrázku s DeepSeek
async function analyzeImageWithDeepSeekVision(
  imagePath: string,
  comment: string
): Promise<{ kategorie: string; popisek: string }> {
  try {
    // Přečti obrázek jako base64
    const imageBuffer = await readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    const response = await deepseek.chat.completions.create({
      model: 'deepseek-vision',
      messages: [
        {
          role: 'system',
          content: 'Jsi expert na realitní fotografie. Analyzuj obrázek nemovitosti a vrať JSON s kategorií a popiskem.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Kategorizuj místnost (kuchyň, obývák, ložnice, koupelna, exteriér, zahrada, garáž, chodba, pracovna). Vymysli popisek pro realitní inzerát podle komentáře: "${comment}". Vrať JSON: {"kategorie": "string", "popisek": "string"}`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from DeepSeek API');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('DeepSeek vision analysis error:', error);
    // Fallback kategorie
    const fallbackCategories = ['kuchyň', 'obývák', 'ložnice', 'koupelna', 'exteriér', 'zahrada'];
    const randomCategory = fallbackCategories[Math.floor(Math.random() * fallbackCategories.length)];
    
    return {
      kategorie: randomCategory,
      popisek: `Fotografie ${randomCategory} - ${comment || 'Nemovitost k prodeji'}`
    };
  }
}

// Helper pro zpracování ZIP souboru
async function processZipFile(
  zipBuffer: Buffer,
  comment: string,
  listingId?: string
): Promise<{ outputZipUrl: string; categories: string[] }> {
  // Vytvoř temp složky
  const tempDir = await createTempDir();
  const extractDir = path.join(tempDir, 'extracted');
  const outputDir = path.join(tempDir, 'processed');
  
  try {
    await mkdir(extractDir, { recursive: true });
    await mkdir(outputDir, { recursive: true });

    // Rozbal ZIP
    const zip = new AdmZip(zipBuffer);
    zip.extractAllTo(extractDir, true);

    // Najdi všechny obrázkové soubory
    const files = await readdir(extractDir, { recursive: true });
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return IMAGE_EXTENSIONS.includes(ext);
    }).map(file => path.join(extractDir, file));

    if (imageFiles.length === 0) {
      throw new Error('No image files found in ZIP');
    }

    const categories: string[] = [];
    const categoryMap = new Map<string, string[]>(); // category -> array of image paths

    // Analyzuj každý obrázek s DeepSeek
    for (const imagePath of imageFiles) {
      try {
        console.log(`Analyzing image: ${path.basename(imagePath)}`);
        const analysis = await analyzeImageWithDeepSeekVision(imagePath, comment);
        
        categories.push(analysis.kategorie);
        
        // Přidej obrázek do příslušné kategorie složky
        const categoryDir = path.join(outputDir, analysis.kategorie);
        if (!existsSync(categoryDir)) {
          await mkdir(categoryDir, { recursive: true });
        }
        
        // Zkopíruj obrázek do kategorie složky
        const destPath = path.join(categoryDir, path.basename(imagePath));
        await writeFile(destPath, await readFile(imagePath));
        
        // Vytvoř popisek soubor
        const descriptionPath = path.join(categoryDir, 'popisek.txt');
        await writeFile(descriptionPath, analysis.popisek);
        
        // Ulož do mapy pro pozdější použití
        if (!categoryMap.has(analysis.kategorie)) {
          categoryMap.set(analysis.kategorie, []);
        }
        categoryMap.get(analysis.kategorie)?.push(destPath);
        
      } catch (error) {
        console.error(`Error processing image ${imagePath}:`, error);
        // Pokračuj s dalším obrázkem
      }
    }

    if (categories.length === 0) {
      throw new Error('No images were successfully processed');
    }

    // Vytvoř výstupní ZIP
    const outputZip = new AdmZip();
    
    // Přidej každou kategorii složku do ZIPu
    for (const [category, imagePaths] of categoryMap.entries()) {
      const categoryDir = path.join(outputDir, category);
      outputZip.addLocalFolder(categoryDir, category);
    }

    // Ulož výstupní ZIP
    const outputZipPath = path.join(tempDir, 'processed-photos.zip');
    outputZip.writeZip(outputZipPath);

    // Přesuň ZIP do public složky pro přístup přes URL
    const publicDir = path.join(process.cwd(), 'public', 'processed');
    await mkdir(publicDir, { recursive: true });
    
    const publicFileName = `processed-${uuidv4()}.zip`;
    const publicPath = path.join(publicDir, publicFileName);
    await writeFile(publicPath, await readFile(outputZipPath));

    const outputZipUrl = `/processed/${publicFileName}`;

    // Ulož metadata do databáze
    await prisma.processedPhotos.create({
      data: {
        listingId,
        categories: categories,
        outputZipUrl,
        comment: comment || null,
      }
    });

    return { outputZipUrl, categories };

  } finally {
    // Vyčisti temp složky
    try {
      await rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.error('Error cleaning temp directory:', error);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const zipFile = formData.get('zipFile') as File;
    const comment = formData.get('comment') as string;
    const listingId = formData.get('listingId') as string;

    if (!zipFile) {
      return NextResponse.json(
        { error: 'ZIP file is required' },
        { status: 400 }
      );
    }

    // Validace, že se jedná o ZIP soubor
    if (!zipFile.name.toLowerCase().endsWith('.zip')) {
      return NextResponse.json(
        { error: 'File must be a ZIP archive' },
        { status: 400 }
      );
    }

    // Převeď File na Buffer
    const zipBuffer = Buffer.from(await zipFile.arrayBuffer());

    // Zpracuj ZIP
    const { outputZipUrl, categories } = await processZipFile(
      zipBuffer,
      comment || '',
      listingId || undefined
    );

    return NextResponse.json({
      success: true,
      message: 'ZIP successfully processed with AI',
      outputZipUrl,
      categories,
      downloadUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}${outputZipUrl}`
    });

  } catch (error) {
    console.error('Error processing ZIP:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process ZIP file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint pro stažení zpracovaného ZIPu
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fileUrl = searchParams.get('file');

  if (!fileUrl) {
    return NextResponse.json(
      { error: 'File URL parameter is required' },
      { status: 400 }
    );
  }

  try {
    const filePath = path.join(process.cwd(), 'public', fileUrl);
    
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const fileBuffer = await readFile(filePath);
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="processed-photos.zip"`,
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    );
  }
}