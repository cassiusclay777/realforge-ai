// MVP: simulace media stránky
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Image, Upload, Filter, Grid, List, Search } from "lucide-react";

export default function MediaPage() {
  const mockMedia = [
    {
      id: "1",
      title: "Byt 2+1 - Obývák",
      listingTitle: "Byt 2+1, Praha 4",
      category: "LIVING_ROOM",
      url: "/uploads/photo1.jpg",
      aiTags: ["moderní", "světlý", "prostorný"],
      processingStatus: "DONE",
      uploadedAt: "2026-02-08T10:30:00Z",
    },
    {
      id: "2",
      title: "Byt 2+1 - Kuchyně",
      listingTitle: "Byt 2+1, Praha 4",
      category: "KITCHEN",
      url: "/uploads/photo2.jpg",
      aiTags: ["nová", "vybavená", "prakticá"],
      processingStatus: "DONE",
      uploadedAt: "2026-02-08T10:31:00Z",
    },
    {
      id: "3",
      title: "Rodinný dům - Fasáda",
      listingTitle: "Rodinný dům, Brno",
      category: "FACADE",
      url: "/uploads/photo3.jpg",
      aiTags: ["zrekonstruovaný", "zahrada", "garáž"],
      processingStatus: "PROCESSING",
      uploadedAt: "2026-02-08T09:20:00Z",
    },
    {
      id: "4",
      title: "Pozemek - Celkový pohled",
      listingTitle: "Pozemek, Ostrava",
      category: "ADVERTISEMENT",
      url: "/uploads/photo4.jpg",
      aiTags: ["rovný", "dopravní dostupnost", "možnost výstavby"],
      processingStatus: "DONE",
      uploadedAt: "2026-02-07T14:25:00Z",
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("cs-CZ");
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "LIVING_ROOM": return "Obývák";
      case "KITCHEN": return "Kuchyně";
      case "BATHROOM": return "Koupelna";
      case "BEDROOM": return "Ložnice";
      case "FACADE": return "Fasáda";
      case "ADVERTISEMENT": return "Inzerční";
      default: return category.toLowerCase().replace("_", " ");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DONE":
        return <Badge variant="outline" className="bg-green-50 text-green-700">Zpracováno</Badge>;
      case "PROCESSING":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Zpracovává se</Badge>;
      case "QUEUED":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Ve frontě</Badge>;
      case "FAILED":
        return <Badge variant="outline" className="bg-red-50 text-red-700">Chyba</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media</h1>
          <p className="text-muted-foreground mt-2">
            Spravujte všechny fotografie a videa vašich listingů
          </p>
        </div>
        <Button className="mt-4 md:mt-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Upload className="h-4 w-4 mr-2" />
          Nahrát média
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Hledat média..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtry
              </Button>
              <Button variant="outline">Všechny kategorie</Button>
              <Button variant="outline">Všechny statusy</Button>
              <div className="flex border rounded-lg">
                <Button variant="ghost" size="icon" className="rounded-r-none">
                  <Grid className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-l-none border-l">
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockMedia.map((media) => (
          <Card key={media.id} className="hover:shadow-lg transition-shadow">
            <div className="aspect-square bg-muted rounded-t-lg overflow-hidden">
              <div className="w-full h-full flex items-center justify-center">
                <Image className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-sm font-medium">{media.title}</CardTitle>
                  <CardDescription className="text-xs mt-1">{media.listingTitle}</CardDescription>
                </div>
                {getStatusBadge(media.processingStatus)}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Kategorie:</span>
                  <span className="text-xs font-medium">{getCategoryLabel(media.category)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Nahráno:</span>
                  <span className="text-xs font-medium">{formatDate(media.uploadedAt)}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">AI tagy:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {media.aiTags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="flex-1 text-xs">
                  Upravit
                </Button>
                <Button variant="outline" className="flex-1 text-xs">
                  AI analýza
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {mockMedia.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Žádná média</h3>
            <p className="text-muted-foreground mb-6">
              Začněte nahráním fotografií pro vaše listingy
            </p>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Upload className="h-4 w-4 mr-2" />
              Nahrát první média
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}