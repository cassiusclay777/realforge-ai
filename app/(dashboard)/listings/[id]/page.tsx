import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { MediaProcessingPanel } from '@/components/MediaProcessingPanel';
import { ListingQuickActions } from '@/components/ListingQuickActions';
import MediaGallery from '@/components/MediaGallery';
import { getCategoryLabel } from '@/lib/category-labels';
import { getTypeLabel, getStatusLabel } from '@/lib/listing-labels';
import { ExpandableText } from '@/components/ExpandableText';

export default async function ListingDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  
  let listing;
  try {
    // Načtení reálných dat z databáze s médii
    listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        media: {
          select: {
            id: true,
            url: true,
            category: true,
            processingStatus: true,
            aiDescription: true,
            aiCaption: true,
            altText: true,
            isFeatured: true,
            sortOrder: true,
          },
          orderBy: {
            sortOrder: 'asc'
          }
        },
        aiResult: {
          select: {
            headline: true,
            shortDesc: true,
            longDesc: true,
            bulletPoints: true,
            seoTitle: true,
            seoDescription: true,
          }
        },
        _count: {
          select: {
            media: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Error loading listing:', error);
    notFound();
  }

  if (!listing) {
    notFound();
  }

  const processedMediaCount = listing.media.filter(m => m.processingStatus === 'DONE').length;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <Link href="/listings" className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
          ← Zpět na inzeráty
        </Link>
        <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
        <p className="text-gray-600">{listing.address}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Levý sloupec - Detaily listingu */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Listing Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Price</p>
                <p className="font-semibold text-lg">
                  {listing.price === 0 ? 'Neuvedeno' : `${listing.price.toLocaleString('cs-CZ')} Kč`}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Type</p>
                <p className="font-semibold">{getTypeLabel(listing.type)}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Status</p>
                <p className="font-semibold">{getStatusLabel(listing.status)}</p>
              </div>
              {listing.area && (
                <div>
                  <p className="text-gray-600 text-sm">Area</p>
                  <p className="font-semibold">{listing.area} m²</p>
                </div>
              )}
              {listing.rooms && (
                <div>
                  <p className="text-gray-600 text-sm">Rooms</p>
                  <p className="font-semibold">{listing.rooms}</p>
                </div>
              )}
              <div>
                <p className="text-gray-600 text-sm">Media Files</p>
                <p className="font-semibold">{listing._count.media}</p>
              </div>
            </div>
            
            {(listing.description || listing.aiResult?.longDesc || listing.aiResult?.shortDesc) && (
              <div className="mt-6">
                <p className="text-gray-600 text-sm mb-2">Popis nemovitosti</p>
                {listing.aiResult?.headline && (
                  <p className="font-semibold text-foreground mb-2">{listing.aiResult.headline}</p>
                )}
                {(listing.aiResult?.longDesc || listing.aiResult?.shortDesc) && (
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {listing.aiResult?.longDesc ?? listing.aiResult?.shortDesc}
                  </p>
                )}
                {listing.description && !listing.aiResult?.longDesc && !listing.aiResult?.shortDesc && (
                  <p className="text-gray-800">{listing.description}</p>
                )}
                {listing.aiResult?.bulletPoints && Array.isArray(listing.aiResult.bulletPoints) && (listing.aiResult.bulletPoints as string[]).length > 0 && (
                  <ul className="mt-3 list-disc list-inside space-y-1 text-gray-800">
                    {(listing.aiResult.bulletPoints as string[]).map((point, i) => (
                      <li key={`bp-${listing.id}-${i}`}>{point}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {!listing.description && !listing.aiResult?.longDesc && !listing.aiResult?.shortDesc && (
              <div className="mt-6 p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                Zatím zde není popis. Můžete ho doplnit v sekci Úprava listingu nebo spustit „Generate AI Content“ v Quick Actions a AI vygeneruje popis z fotek.
              </div>
            )}
          </div>

          {/* Fotografie – menší mřížka, zvětšení po kliknutí */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Fotografie</h2>
              <span className="text-sm text-muted-foreground">
                {processedMediaCount} z {listing._count.media} zpracováno · klik pro zvětšení
              </span>
            </div>
            <MediaGallery
              media={listing.media}
              listingId={id}
              compact={true}
            />
            {listing.media.some(m => m.aiDescription && m.processingStatus === 'DONE') && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="font-medium mb-2">AI popisky</h3>
                <div className="space-y-3">
                  {listing.media
                    .filter(m => m.aiDescription && m.processingStatus === 'DONE')
                    .map((media) => (
                      <div key={media.id} className="border-b border-border/50 pb-3 last:border-0 last:pb-0">
                        <span className="font-medium text-foreground">{getCategoryLabel(media.category)}:</span>{" "}
                        <ExpandableText text={media.aiDescription!} maxLength={120} />
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pravý sloupec - Media Processing Panel */}
        <div className="lg:col-span-1">
          <MediaProcessingPanel 
            listingId={id}
            showMediaPreview={true}
            autoStartPolling={true}
          />
          
          {/* Další akce */}
          <div className="mt-6 rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <ListingQuickActions listingId={id} mediaCount={listing._count.media} />
          </div>
        </div>
      </div>
    </div>
  );
}
