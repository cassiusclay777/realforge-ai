import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readdir, rm, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ensureListingOwnership } from '@/lib/api-listing-auth';
import { analyzeImageForZip } from '@/lib/deepseek-vision';

// Podporované image extensions
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];

// Helper pro vytvoření temp složky
async function createTempDir(): Promise<string> {
  const tempDir = path.join(process.cwd(), 'temp', uuidv4());
  await mkdir(tempDir, { recursive: true });
  return tempDir;
}

// Analýza obrázku přes DeepSeek Vision API (/v1/vision) – kategorie + konkrétní popisek
async function analyzeImageWithDeepSeekVision(
  imagePath: string,
  comment: string
): Promise<{ kategorie: string; popisek: string }> {
  try {
    const imageBuffer = await readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');
    return await analyzeImageForZip(base64Image, comment);
  } catch (error) {
    console.error('DeepSeek vision analysis error:', error);
    return {
      kategorie: 'ostatní',
      popisek: 'Fotografie nemovitosti (automatická klasifikace nebyla k dispozici).'
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
    const categoryMap = new Map<string, string[]>();
    const categoryPopisky = new Map<string, { basename: string; popisek: string }[]>();

    // Analyzuj každý obrázek s DeepSeek
    for (const imagePath of imageFiles) {
      try {
        const basename = path.basename(imagePath);
        console.log(`Analyzing image: ${basename}`);
        const analysis = await analyzeImageWithDeepSeekVision(imagePath, comment);

        categories.push(analysis.kategorie);
        const categoryDir = path.join(outputDir, analysis.kategorie);
        if (!existsSync(categoryDir)) {
          await mkdir(categoryDir, { recursive: true });
        }

        const destPath = path.join(categoryDir, basename);
        await writeFile(destPath, await readFile(imagePath));

        if (!categoryMap.has(analysis.kategorie)) {
          categoryMap.set(analysis.kategorie, []);
          categoryPopisky.set(analysis.kategorie, []);
        }
        categoryMap.get(analysis.kategorie)?.push(destPath);
        categoryPopisky.get(analysis.kategorie)?.push({ basename, popisek: analysis.popisek });
      } catch (error) {
        console.error(`Error processing image ${imagePath}:`, error);
      }
    }

    // Jeden popisek.txt per kategorie: řádky "soubor: popis"
    for (const [category, polozky] of categoryPopisky) {
      const lines = polozky.map(p => `${p.basename}: ${p.popisek}`).join('\n\n');
      const descriptionPath = path.join(outputDir, category, 'popisek.txt');
      await writeFile(descriptionPath, lines, 'utf-8');
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Neautorizováno' }, { status: 401 });
    }

    const formData = await request.formData();
    
    const zipFile = formData.get('zipFile') as File;
    const comment = formData.get('comment') as string;
    const listingId = formData.get('listingId') as string;

    if (listingId) {
      const auth = await ensureListingOwnership(listingId, session.user.id);
      if ('error' in auth) return auth.error;
    }

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
      downloadUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3050'}${outputZipUrl}`
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Neautorizováno' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const fileUrl = searchParams.get('file');

  if (!fileUrl) {
    return NextResponse.json(
      { error: 'File URL parameter is required' },
      { status: 400 }
    );
  }

  try {
    const normalizedFile = path
      .normalize(fileUrl)
      .replace(/^[\\/]+/, '')
      .replace(/^(\.\.(\/|\\|$))+/, '');
    const relativeFile = normalizedFile.startsWith('processed/')
      ? normalizedFile
      : `processed/${normalizedFile}`;
    const baseDir = path.resolve(process.cwd(), 'public', 'processed');
    const filePath = path.resolve(path.join(process.cwd(), 'public', relativeFile));

    if (!filePath.startsWith(baseDir + path.sep)) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      );
    }
    
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