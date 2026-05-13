import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Upload, 
  FileText, 
  Users, 
  BarChart3, 
  Settings,
  PlusCircle,
  Eye,
  CheckCircle,
  Clock,
  Search,
  Download,
  Filter,
  TrendingUp,
  DollarSign,
  MessageSquare,
  PieChart,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { getStatusLabel } from "@/lib/listing-labels";
import DashboardStats from "@/components/dashboard/stats-cards";
import DashboardCharts from "@/components/dashboard/charts";
import CRMChat from "@/components/dashboard/crm-chat";

function listingCardTitle(title: string, address: string): string {
  const t = title?.trim() ?? "";
  if (t === "" || t === "Nemovitost") return address ? `Nemovitost – ${address}` : "Nemovitost";
  return title;
}

function formatListingPrice(price: number): string {
  if (price === 0) return "Neuvedeno";
  return `${price.toLocaleString("cs-CZ")} Kč`;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  let dashboardStats = null;
  let demoListings: { id: string; title: string; status: string; address: string; price: number; area: number; rooms: number; aiResult: boolean }[] = [];
  try {
    const [listingCount, leadCount, recentListings, dealsSum] = await Promise.all([
      prisma.listing.count(),
      prisma.cRMLead.count(),
      prisma.listing.findMany({
        orderBy: { createdAt: "desc" },
        take: 4,
        select: {
          id: true,
          title: true,
          status: true,
          address: true,
          price: true,
          area: true,
          rooms: true,
          aiResult: { select: { id: true } },
        },
      }),
      prisma.deal.aggregate({ _sum: { price: true }, where: { status: { not: "SOLD" } } }),
    ]);
    const processedCount = await prisma.listing.count({
      where: { aiResult: { isNot: null } },
    });
    dashboardStats = {
      totalListings: listingCount,
      activeListings: await prisma.listing.count({ where: { status: "ACTIVE" } }),
      totalLeads: leadCount,
      totalCommissions: dealsSum._sum.price ?? 0,
      listingViews: (await prisma.listing.aggregate({ _sum: { views: true } }))._sum.views ?? 0,
      leadResponseTime: 2.5,
      dealConversion: leadCount > 0 ? Math.round((await prisma.cRMLead.count({ where: { status: "CLOSED" } })) / leadCount * 100) : 0,
      aiPipelineProgress: listingCount > 0 ? Math.round((processedCount / listingCount) * 100) : 0,
    };
    demoListings = recentListings.map((l) => ({
      id: l.id,
      title: l.title,
      status: l.status,
      address: l.address,
      price: l.price,
      area: l.area ?? 0,
      rooms: l.rooms ?? 0,
      aiResult: !!l.aiResult,
    }));
  } catch (e) {
    console.error("Dashboard stats error:", e);
    demoListings = [
      { id: "1", title: "Luxusní byt Praha 1", status: "ACTIVE", address: "Praha 1", price: 12500000, area: 85, rooms: 3, aiResult: true },
      { id: "2", title: "Rodinný dům Brno", status: "ACTIVE", address: "Brno", price: 8500000, area: 120, rooms: 5, aiResult: true },
    ];
  }


  const quickActions = [
    {
      title: "Nahrát nový inzerát",
      description: "Začněte s novým AI inzerátem",
      icon: <Upload className="h-5 w-5" />,
      href: "/upload",
      color: "bg-blue-500/15 text-blue-400",
    },
    {
      title: "Všechny inzeráty",
      description: "Přehled všech vašich inzerátů",
      icon: <Home className="h-5 w-5" />,
      href: "/listings",
      color: "bg-primary/15 text-primary",
    },
    {
      title: "CRM – Zájemci",
      description: "Spravujte své zájemce",
      icon: <Users className="h-5 w-5" />,
      href: "/crm",
      color: "bg-orange-500/15 text-orange-400",
    },
    {
      title: "Nastavení účtu",
      description: "Upravte si profil a nastavení",
      icon: <Settings className="h-5 w-5" />,
      href: "/settings",
      color: "bg-secondary text-muted-foreground",
    },
  ];

  return (
    <div className="w-full space-y-8">
      {/* Header with Search and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Vítejte zpět, {session.user.name || session.user.email}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Přehled vašich inzerátů, CRM, analytics a AI nástrojů
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Hledat inzeráty, zájemce..."
              className="pl-9 pr-4 py-2 bg-card border border-border rounded-lg w-full md:w-64 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
            />
          </div>
          <Link href="/listings">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtry
            </Button>
          </Link>
          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Modern Stats Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            Klíčové metriky
          </h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Aktualizováno před 5 minutami</span>
          </div>
        </div>
        <DashboardStats stats={dashboardStats ?? undefined} />
      </div>

      {/* Charts Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            Analytics & Grafy
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Posledních 6 měsíců
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
        <DashboardCharts />
      </div>

      {/* CRM & Chat Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            CRM & Live Chat
          </h2>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              <MessageSquare className="h-3 w-3 mr-1" />
              3 nové zprávy
            </Badge>
            <Button size="sm" variant="outline">
              <PlusCircle className="h-4 w-4 mr-2" />
              Nový lead
            </Button>
          </div>
        </div>
        <CRMChat />
      </div>

      {/* Recent Listings & AI Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Listings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Nejnovější inzeráty</CardTitle>
              <Button size="sm" variant="ghost">
                <Link href="/listings" className="flex items-center gap-2">
                  Zobrazit všechny
                  <TrendingUp className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <CardDescription>
              Přehled vašich posledních AI inzerátů s drag & drop funkcionalitou
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {demoListings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 group cursor-move"
                  draggable="true"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Home className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">
                        {listingCardTitle(listing.title, listing.address)}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge
                          variant={
                            listing.status === "ACTIVE"
                              ? "default"
                              : listing.status === "SOLD" || listing.status === "PRODANO"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {getStatusLabel(listing.status)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {listing.address}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-foreground">
                      {formatListingPrice(listing.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-muted-foreground">
                        {listing.area} m² • {listing.rooms} pokojů
                      </p>
                      {listing.aiResult && (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                          AI ✓
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground text-center">
                Drag & drop pro změnu pořadí • Klikněte pro detail
              </p>
            </div>
          </CardContent>
        </Card>

        {/* AI Tools & Quick Actions */}
        <div className="space-y-6">
          {/* AI Price Optimizer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                AI Price Optimizer
              </CardTitle>
              <CardDescription>
                Optimalizujte ceny pomocí AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Luxusní byt Praha 1</p>
                      <p className="text-sm text-muted-foreground">Aktuální: 12.5M Kč</p>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      +8.5%
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-foreground">
                      AI doporučení: <span className="text-lg text-blue-400">13.6M Kč</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Na základě 42 podobných prodejů
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Rodinný dům Brno</p>
                      <p className="text-sm text-muted-foreground">Aktuální: 8.5M Kč</p>
                    </div>
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      +12.3%
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-foreground">
                      AI doporučení: <span className="text-lg text-primary">9.5M Kč</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tržní poptávka +15%
                    </p>
                  </div>
                </div>

                <Button className="w-full">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Spustit AI analýzu všech inzerátů
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Rychlé akce
              </CardTitle>
              <CardDescription>
                Nejčastější operace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <Link key={index} href={action.href}>
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        {action.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{action.title}</p>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}