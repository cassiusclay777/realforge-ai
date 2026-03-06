import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export default async function ListingsPage() {
  // Načtení reálných dat z databáze
  let listings = [];
  try {
    listings = await prisma.listing.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20, // Limit na 20 listingů pro výkon
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
      },
    ];
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NOVA': return <Badge className="bg-blue-500">Nový</Badge>;
      case 'AKTIVNI': return <Badge className="bg-green-500">Aktivní</Badge>;
      case 'REZERVACE': return <Badge className="bg-yellow-500">Rezervace</Badge>;
      case 'PRODANO': return <Badge className="bg-purple-500">Prodáno</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Přehled listingů</h1>
          <p className="text-muted-foreground mt-2">
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
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Zatím nemáte žádné listy nemovitostí
            </p>
            <Link href="/upload">
              <Button>Vytvořit první listing</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden">
              <div className="relative h-48 bg-gray-100">
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🏠</div>
                    <p className="text-sm">Žádná fotografie</p>
                  </div>
                </div>
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
                    <span>{listing.type}</span>
                  </div>
                  {listing.area && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plocha:</span>
                      <span>{listing.area} m²</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">AI analýza:</span>
                    <span>
                      {listing.aiResult ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Hotovo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                          Čeká
                        </Badge>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Link href={`/listings/${listing.id}`} className="flex-1">
                    <Button variant="outline" className="w-full flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Detail
                    </Button>
                  </Link>
                  <Button variant="outline" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
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