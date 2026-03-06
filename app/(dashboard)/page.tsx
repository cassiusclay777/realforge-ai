import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Building2, 
  Users, 
  Zap, 
  Globe, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Home as HomeIcon
} from "lucide-react";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="mb-12 animate-in-fade">
        <div className="inline-flex items-center rounded-full border border-border bg-card/80 backdrop-blur px-4 py-2 text-sm font-medium mb-6">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span>Trusted by 250+ real estate agencies</span>
        </div>
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Jeden listing. Všechny portály. Za 30 vteřin.
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            REALFORGE AI se postará o fotky, popis i exporty. Ty se staráš jen o klienty.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button size="lg" className="gap-2 shadow-lg shadow-primary/20" asChild>
              <Link href="/upload">
                <Upload className="h-5 w-5" />
                Nahrát první listing
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2" asChild>
              <Link href="/listings">
                <Building2 className="h-5 w-5" />
                Zobrazit listingy
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Top Action Cards */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* New Listing Card */}
          <Card className="border-primary/20 bg-card/80 backdrop-blur hover:border-primary/30 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <Badge className="bg-primary/20 text-primary border-primary/30">Hlavní CTA</Badge>
              </div>
              <h3 className="text-xl font-semibold mb-2">New listing</h3>
              <p className="text-muted-foreground mb-4">
                Nahrát nový listing
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                AI ti udělá fotky, popis a exporty za méně než 30 s.
              </p>
              <Button className="w-full gap-2 shadow-md shadow-primary/20" asChild>
                <Link href="/upload">
                  <Upload className="h-4 w-4" />
                  Začít nový listing
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pipeline Today Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <Badge variant="outline" className="text-xs">Dnes</Badge>
              </div>
              <h3 className="text-xl font-semibold mb-4">Pipeline dnes</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Nové leady</span>
                  <span className="text-lg font-semibold">5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Otevřené úkoly</span>
                  <span className="text-lg font-semibold">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Probíhající exporty</span>
                  <span className="text-lg font-semibold">2</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Queue Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="outline" className="text-xs">Tento měsíc</Badge>
              </div>
              <h3 className="text-xl font-semibold mb-4">AI queue</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Ve frontě</span>
                  <span className="text-lg font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Odhadované náklady</span>
                  <span className="text-lg font-semibold text-primary">1,450 Kč</span>
                </div>
                <div className="pt-2">
                  <div className="text-xs text-muted-foreground mb-1">Využití AI tento měsíc</div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Analytics & Recent Activity */}
      <section className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leads Chart Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Leady za posledních 30 dní
              </CardTitle>
              <CardDescription>
                Přehled nových leadů a konverzí
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 rounded-lg border border-border bg-card flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">142</div>
                  <div className="text-muted-foreground">Celkem leadů</div>
                  <div className="text-sm text-green-500 mt-2">+12% oproti minulému měsíci</div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  7 dní
                </Button>
                <Button variant="default" size="sm" className="flex-1">
                  30 dní
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  90 dní
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Listings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent listings
              </CardTitle>
              <CardDescription>
                Poslední 5 listingů s aktuálním stavem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Listing Item 1 */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                      <HomeIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Na Příkopě 22</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">Draft</Badge>
                        <span className="text-xs text-muted-foreground">2h ago</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1">
                    Pokračovat
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>

                {/* Listing Item 2 */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                      <HomeIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Václavské nám. 5</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          Exported
                        </Badge>
                        <span className="text-xs text-muted-foreground">Yesterday</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1">
                    Zobrazit
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>

                {/* Listing Item 3 */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                      <HomeIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Karlovo nám. 8</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Published
                        </Badge>
                        <span className="text-xs text-muted-foreground">1d ago</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1">
                    Editovat
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>

                {/* View All Button */}
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link href="/listings">Zobrazit všechny listingy</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Automation Section */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Automatizace portálů
            </CardTitle>
            <CardDescription>
              Propojení s realitními portály a automatické synchronizace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sreality Card */}
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
<div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-primary" />
                    </div>
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Připojeno
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Sreality</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Poslední synchronizace: 2h ago
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Spravovat
                    </Button>
                    <Button variant="ghost" size="sm">
                      Odpojit
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Bezrealitky Card */}
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Globe className="h-6 w-6 text-secondary" />
                    </div>
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Připojeno
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Bezrealitky</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Poslední synchronizace: 1d ago
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Spravovat
                    </Button>
                    <Button variant="ghost" size="sm">
                      Odpojit
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* FB Marketplace Card */}
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                      <Globe className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <Badge variant="outline" className="text-muted-foreground">
                      <XCircle className="h-3 w-3 mr-1" />
                      Nepřipojeno
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">FB Marketplace</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Poslední synchronizace: Nikdy
                  </p>
                  <Button className="w-full" size="sm">
                    Připojit
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Technical Stack Section (Subtle) */}
      <section className="mt-12 pt-8 border-t border-border">
        <div className="text-center">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Pro developery
          </h3>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <span>Next.js 14+</span>
            <span>•</span>
            <span>Prisma</span>
            <span>•</span>
            <span>PostgreSQL</span>
            <span>•</span>
            <span>Python AI</span>
            <span>•</span>
            <span>Tailwind CSS</span>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Built with modern stack for reliability and performance
          </p>
        </div>
      </section>
    </>
  );
}