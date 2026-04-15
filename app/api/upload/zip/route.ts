import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { imageProcessDeepSeekQueue } from '@/lib/queues';
import { parsePositiveInt } from '@/lib/validation/numbers';
import { ensureListingOwnership } from '@/lib/api-listing-auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

function titleFromFilename(name: string): string {
  const ext = path.extname(name);
  return path.basename(name, ext) || name;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Neautorizováno" },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    const formData = await request.formData();
    const rawFiles = formData.getAll('zipFile');
    const files = (Array.isArray(rawFiles) ? rawFiles : [rawFiles]).filter(
      (f): f is File => f instanceof File && f.size > 0
    );

    if (files.length === 0) {
      return NextResponse.json({ error: 'No file uploaded or file is empty' }, { status: 400 });
    }

    const acceptedTypes = ['.zip', '.7z', '.rar', '.ZIP', '.RAR'];
    for (const file of files) {
      const fileExt = path.extname(file.name).toLowerCase();
      if (!acceptedTypes.includes(fileExt)) {
        return NextResponse.json({
          error: 'Invalid file type',
          details: `File type ${fileExt} not allowed. Allowed: ${acceptedTypes.join(', ')}`,
          fileName: file.name,
        }, { status: 400 });
      }
    }

    // Batch: více souborů → každý listing s názvem z názvu souboru, type APARTMENT (AI přepíše), price 0 (AI doplní)
    if (files.length > 1) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });
      const results: { listingId: string; zipUrl: string; fileName: string; jobId?: string }[] = [];
      let queueOk = true;

      for (const file of files) {
        const title = titleFromFilename(file.name);
        const listing = await prisma.listing.create({
          data: {
            title,
            address: '',
            type: 'APARTMENT',
            price: 0,
            area: null,
            rooms: null,
            status: 'NEW',
            createdById: userId ?? undefined,
          },
        });
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${listing.id}-${file.name}`;
        const filePath = path.join(uploadDir, fileName);
        await writeFile(filePath, buffer);
        const zipUrl = `/uploads/${fileName}`;
        await prisma.listing.update({
          where: { id: listing.id },
          data: { sourceZipUrl: zipUrl },
        });
        let jobId: string | undefined;
        try {
          const job = await imageProcessDeepSeekQueue.add('process-listing-deepseek', {
            listingId: listing.id,
            zipUrl,
            title,
            price: 0,
            address: '',
            type: 'APARTMENT',
            area: null,
            rooms: null,
            userId,
            inferPropertyType: true,
          });
          jobId = job.id ?? undefined;
          // #region agent log
          fetch('http://127.0.0.1:7814/ingest/3261ec9b-bf07-4b9b-a0d3-3754008137eb',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'831b70'},body:JSON.stringify({sessionId:'831b70',location:'upload/zip/route.ts:batch-job',message:'Batch job added with inferPropertyType',data:{listingId:listing.id,jobId:jobId??null,inferPropertyType:true},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
          // #endregion
        } catch {
          queueOk = false;
        }
        results.push({ listingId: listing.id, zipUrl, fileName: file.name, jobId });
      }

      return NextResponse.json({
        success: true,
        batch: true,
        results,
        count: results.length,
        message: queueOk
          ? `Nahráno ${results.length} ZIPů. AI zpracovává obrázky (fronta, concurrency 2).`
          : `Nahráno ${results.length} ZIPů. Spusť Redis a worker pro zpracování.`,
      });
    }

    // Jeden soubor – původní chování s formulářem
    const file = files[0];
    const listingId = (formData.get('listingId') as string | null)?.trim() || null;
    const title = formData.get('title') as string;
    const address = formData.get('address') as string;
    const type = formData.get('type') as string;
    const price = formData.get('price') as string;
    const area = formData.get('area') as string;
    const rooms = formData.get('rooms') as string;

    if (listingId && files.length > 1) {
      return NextResponse.json(
        { error: 'Pro doplnění médií k existujícímu listingu lze nahrát pouze jeden ZIP' },
        { status: 400 }
      );
    }

    if (!listingId && (!title?.trim() || !address?.trim() || !price?.trim())) {
      return NextResponse.json(
        { error: 'U jednoho souboru jsou povinná pole: název, adresa, cena' },
        { status: 400 }
      );
    }

    const typeMap: Record<string, string> = {
      'BYT': 'APARTMENT',
      'APARTMENT': 'APARTMENT',
      'APARTMÁN': 'APARTMENT',
      'DŮM': 'HOUSE',
      'HOUSE': 'HOUSE',
      'DOM': 'HOUSE',
      'POZEMEK': 'LAND',
      'LAND': 'LAND',
      'PARCELA': 'LAND',
    };
    const listingType = typeMap[type?.toUpperCase() ?? ''] || 'APARTMENT';
    const parsedPrice = parsePositiveInt(price);
    if (!listingId && (parsedPrice === null || parsedPrice <= 0)) {
      return NextResponse.json(
        { error: 'Neplatná cena (musí být kladné číslo)' },
        { status: 400 }
      );
    }
    const parsedArea = parsePositiveInt(area);
    const parsedRooms = parsePositiveInt(rooms);

    let listing = null as Awaited<ReturnType<typeof prisma.listing.findUnique>>;

    if (listingId) {
      const auth = await ensureListingOwnership(listingId, userId);
      if ('error' in auth) return auth.error;
      listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: {
          id: true,
          title: true,
          address: true,
          type: true,
          price: true,
          area: true,
          rooms: true,
          createdById: true,
        },
      });
      if (!listing) {
        return NextResponse.json({ error: 'Listing nenalezen' }, { status: 404 });
      }
    } else {
      listing = await prisma.listing.create({
        data: {
          title: title.trim(),
          address: address.trim(),
          type: listingType as 'APARTMENT' | 'HOUSE' | 'LAND',
          price: parsedPrice as number,
          area: parsedArea ?? null,
          rooms: parsedRooms ?? null,
          status: 'NEW',
          createdById: userId ?? undefined,
        },
        select: {
          id: true,
          title: true,
          address: true,
          type: true,
          price: true,
          area: true,
          rooms: true,
          createdById: true,
        },
      });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    const fileName = `${listing.id}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    const zipUrl = `/uploads/${fileName}`;
    await prisma.listing.update({
      where: { id: listing.id },
      data: {
        sourceZipUrl: zipUrl,
        status: 'NEW',
      },
    });

    let jobId: string | null = null;
    try {
      const job = await imageProcessDeepSeekQueue.add('process-listing-deepseek', {
        listingId: listing.id,
        zipUrl,
        title: listing.title,
        price: listing.price,
        address: listing.address,
        type: listing.type,
        area: listing.area,
        rooms: listing.rooms,
        userId,
      });
      jobId = job.id ?? null;
    } catch (queueError) {
      const code = (queueError as { code?: string })?.code;
      console.warn('⚠️ Queue unavailable (Redis?)', code || '');
    }

    return NextResponse.json({
      success: true,
      listingId: listing.id,
      zipUrl,
      fileName: file.name,
      jobId: jobId ?? undefined,
      message: jobId
        ? listingId
          ? 'Média byla přidána. DeepSeek AI zpracování bylo spuštěno.'
          : 'Upload successful. DeepSeek AI is processing your images...'
        : 'Soubor uložen. Spusť Redis a worker (npm run dev) pro zpracování obrázků.',
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    const details = err.message || (error as { code?: string })?.code || String(error).slice(0, 200);
    console.error('❌ Upload error:', error);
    console.error('Error details:', details);

    return NextResponse.json(
      {
        error: 'Upload failed',
        details: details || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
