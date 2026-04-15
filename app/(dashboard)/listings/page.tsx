import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getTypeLabel } from '@/lib/listing-labels';

export const dynamic = "force-dynamic";

export default async function ListingsPage() {
  // Načtení reálných dat z databáze
  let listings = [];
  try {
    listings = await prisma.listing.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        media: {
          where: { processingStatus: 'DONE' },
          orderBy: { sortOrder: 'asc' },
          take: 1,
          select: { id: true, url: true },
        },
        aiResult: { select: { id: true } },
      },
    });
  } catch (error) {
    console.error('Error loading listings:', error);
    // Fallback na demo data při chybě
    listings = [
      {
        id: 'cmm168mos0001oi923ix7rwm0',
        title: 'Prodej zahrady 756m2 v Moravském Krumlově',
        address: 'Moravský Krumlov',
        price: 0,
        type: 'LAND',
        area: 756,
        rooms: null,
        status: 'PROCESSING',
        aiResult: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdById: null,
        media: [],
      },
      {
        id: 'cmm15vm6w0000oi92ky91btuy',
        title: 'Prodej zahrady 756m2 v Moravském Krumlově',
        address: 'Moravský Krumlov',
        price: 0,
        type: 'LAND',
        area: 756,
        rooms: null,
        status: 'PROCESSING',
        aiResult: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdById: null,
        media: [],
      },
    ];
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      NEW: { label: 'Nový', variant: 'default' },
      PROCESSING: { label: 'Zpracovává se', variant: 'secondary' },
      PROCESSED: { label: 'Připraveno', variant: 'default' },
      ACTIVE: { label: 'Aktivní', variant: 'default' },
      REZERVACE: { label: 'Rezervace', variant: 'outline' },
      PRODANO: { label: 'Prodáno', variant: 'secondary' },
    };
    const t = map[status] ?? { label: status, variant: 'outline' as const };
    return <Badge variant={t.variant}>{t.label}</Badge>;
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Neuvedeno';
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="max-w-6xl mx-auto" suppressHydrationWarning>
      <div className="flex justify-between items-center page-header">
        <div>
          <h1 className="page-title">Přehled listingů</h1>
          <p className="page-subtitle">
            Celkem {listings.length} nemovitostí
          </p>
        </div>
        <Link href="/upload">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nový listing
          </Button>
        </Link>
      </div>

      {listings.length === 0 ? (
        <Card className="text-center py-16 border-dashed">
          <CardContent className="space-y-4">
            <div className="text-5xl text-muted-foreground/70">🏠</div>
            <h2 className="text-xl font-semibold text-foreground">Zatím nemáte žádné inzeráty</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Nahrajte ZIP s fotkami a začněte s AI popisy.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link href="/upload">
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nahrát nový inzerát
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden">
              <div className="relative h-48 bg-muted">
                {listing.media?.[0]?.url && !listing.media[0].url.includes('placeholder') ? (
                  <img
                    src={listing.media[0].url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🏠</div>
                      <p className="text-sm">Žádná fotografie</p>
                    </div>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {getStatusBadge(listing.status)}
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg truncate">{listing.title}</CardTitle>
                <p className="text-sm text-muted-foreground truncate">
                  {listing.address}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cena:</span>
                    <span className="font-bold">{formatPrice(listing.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Typ:</span>
                    <span>{getTypeLabel(listing.type)}</span>
                  </div>
                  {listing.area && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plocha:</span>
                      <span>{listing.area} m²</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-muted-foreground">AI text (popis, SEO):</span>
                    <span>
                      {listing.aiResult ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Hotovo
                        </Badge>
                      ) : (
                        <Link href={`/listings/${listing.id}`} prefetch={false}>
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 cursor-pointer">
                            Spustit v detailu →
                          </Badge>
                        </Link>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Link href={`/listings/${listing.id}`} className="flex-1" prefetch={false}>
                    <Button variant="outline" className="w-full flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Detail
                    </Button>
                  </Link>
                  <Link href={`/listings/${listing.id}/edit`} prefetch={false}>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled
                    title="Mazání listingu bude dostupné v další verzi"
                    aria-label="Mazání listingu zatím není dostupné"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}