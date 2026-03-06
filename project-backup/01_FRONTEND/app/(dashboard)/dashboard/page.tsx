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
import DashboardStats from "@/components/dashboard/stats-cards";
import DashboardCharts from "@/components/dashboard/charts";
import CRMChat from "@/components/dashboard/crm-chat";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Demo data pro dashboard - protože Listing a CRMLead modely neexistují v Prisma schématu
  // Pro plnou funkčnost je potřeba přidat tyto modely do schema.prisma
  const demoListings = [
    { id: "1", title: "Luxusní byt Praha 1", status: "ACTIVE", address: "Praha 1", price: 12500000, area: 85, rooms: 3, aiResult: true },
    { id: "2", title: "Rodinný dům Brno", status: "ACTIVE", address: "Brno", price: 8500000, area: 120, rooms: 5, aiResult: true },
    { id: "3", title: "Kancelářské prostory", status: "SOLD", address: "Praha 5", price: 21000000, area: 200, rooms: 8, aiResult: true },
    { id: "4", title: "Garsonka Ostrava", status: "ACTIVE", address: "Ostrava", price: 3200000, area: 35, rooms: 1, aiResult: false },
  ];

  const quickActions = [
    {
      title: "Nahrát nový inzerát",
      description: "Začněte s novým AI inzerátem",
      icon: <Upload className="h-6 w-6" />,
      href: "/upload",
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Zobrazit všechny inzeráty",
      description: "Přehled všech vašich inzerátů",
      icon: <Home className="h-6 w-6" />,
      href: "/listings",
      color: "bg-green-100 text-green-700",
    },
    {
      title: "CRM - Zájemci",
      description: "Spravujte své zájemce",
      icon: <Users className="h-6 w-6" />,
      href: "/crm",
      color: "bg-orange-100 text-orange-700",
    },
    {
      title: "Nastavení účtu",
      description: "Upravte si profil a nastavení",
      icon: <Settings className="h-6 w-6" />,
      href: "/settings",
      color: "bg-gray-100 text-gray-700",
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Hledat inzeráty, zájemce..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtry
          </Button>
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
        <DashboardStats />
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
            <Badge variant="outline" className="bg-green-50 text-green-700">
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
                        {listing.title}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge
                          variant={
                            listing.status === "ACTIVE"
                              ? "default"
                              : listing.status === "SOLD"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {listing.status === "ACTIVE"
                            ? "Aktivní"
                            : listing.status === "SOLD"
                            ? "Prodané"
                            : "Nové"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {listing.address}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-foreground">
                      {listing.price.toLocaleString()} Kč
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-muted-foreground">
                        {listing.area} m² • {listing.rooms} pokojů
                      </p>
                      {listing.aiResult && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
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
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-800">Luxusní byt Praha 1</p>
                      <p className="text-sm text-blue-600">Aktuální: 12.5M Kč</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      +8.5%
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-blue-800">
                      AI doporučení: <span className="text-lg">13.6M Kč</span>
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Na základě 42 podobných prodejů
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-800">Rodinný dům Brno</p>
                      <p className="text-sm text-green-600">Aktuální: 8.5M Kč</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      +12.3%
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-green-800">
                      AI doporučení: <span className="text-lg">9.5M Kč</span>
                    </p>
                    <p className="text-xs text-green-600 mt-1">
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
              
              {/* Dark Mode Toggle */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg dark:bg-gray-800">
                      <div className="h-5 w-5 bg-gray-300 rounded-full dark:bg-gray-600"></div>
                    </div>
                    <div>
                      <p className="font-medium">Dark Mode</p>
                      <p className="text-sm text-muted-foreground">Automaticky podle systému</p>
                    </div>
                  </div>
                  <div className="relative inline-block w-12 h-6">
                    <input type="checkbox" className="sr-only" id="dark-mode-toggle" />
                    <label 
                      htmlFor="dark-mode-toggle" 
                      className="block w-12 h-6 rounded-full bg-gray-300 cursor-pointer dark:bg-gray-700"
                    >
                      <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform"></div>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}