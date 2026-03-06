// MVP: simulace analytics stránky
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, TrendingUp, Users, Eye, DollarSign, Calendar, Filter } from "lucide-react";

export default function AnalyticsPage() {
  const mockStats = [
    { label: "Celkem listingů", value: "24", change: "+12%", icon: BarChart, color: "text-blue-500" },
    { label: "Aktivní leady", value: "18", change: "+8%", icon: Users, color: "text-green-500" },
    { label: "Zobrazení", value: "1.2k", change: "+23%", icon: Eye, color: "text-purple-500" },
    { label: "Průměrná cena", value: "4.8M Kč", change: "+5%", icon: DollarSign, color: "text-orange-500" },
  ];

  const mockChartData = [
    { month: "Led", listings: 8, leads: 12, views: 850 },
    { month: "Úno", listings: 12, leads: 18, views: 1200 },
    { month: "Bře", listings: 15, leads: 22, views: 1450 },
    { month: "Dub", listings: 18, leads: 24, views: 1650 },
    { month: "Kvě", listings: 20, leads: 28, views: 1900 },
    { month: "Čer", listings: 24, leads: 32, views: 2200 },
  ];

  const mockTopListings = [
    { title: "Byt 2+1, Praha 4", views: 320, leads: 8, conversion: "2.5%" },
    { title: "Rodinný dům, Brno", views: 280, leads: 6, conversion: "2.1%" },
    { title: "Pozemek, Ostrava", views: 210, leads: 4, conversion: "1.9%" },
    { title: "Byt 3+1, Praha 2", views: 190, leads: 3, conversion: "1.6%" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Přehled výkonu a metrik vašich realitních listingů
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Posledních 30 dní
          </Button>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtry
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {mockStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <span className="text-sm text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`h-10 w-10 rounded-lg bg-opacity-10 ${stat.color.replace('text-', 'bg-')} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Růst výkonu</CardTitle>
            <CardDescription>
              Přehled vývoje listingů, leadů a zobrazení za posledních 6 měsíců
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-4 pt-8">
              {mockChartData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="text-xs text-muted-foreground mb-2">{data.month}</div>
                  <div className="w-full flex gap-1 justify-center" style={{ height: '180px' }}>
                    <div 
                      className="w-1/3 bg-blue-500 rounded-t"
                      style={{ height: `${(data.listings / 30) * 100}%` }}
                      title={`${data.listings} listingů`}
                    />
                    <div 
                      className="w-1/3 bg-green-500 rounded-t"
                      style={{ height: `${(data.leads / 40) * 100}%` }}
                      title={`${data.leads} leadů`}
                    />
                    <div 
                      className="w-1/3 bg-purple-500 rounded-t"
                      style={{ height: `${(data.views / 2500) * 100}%` }}
                      title={`${data.views} zobrazení`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="text-sm">Listingy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm">Leady</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-purple-500" />
                <span className="text-sm">Zobrazení</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Listings */}
        <Card>
          <CardHeader>
            <CardTitle>Nejúspěšnější listingy</CardTitle>
            <CardDescription>
              Listingy s nejvyšším engagementem a konverzí
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTopListings.map((listing, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{listing.title}</p>
                    <div className="flex gap-4 mt-1">
                      <span className="text-xs text-muted-foreground">{listing.views} zobrazení</span>
                      <span className="text-xs text-muted-foreground">{listing.leads} leadů</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{listing.conversion}</p>
                    <p className="text-xs text-muted-foreground">konverze</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Platform Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Výkon podle platformy</CardTitle>
            <CardDescription>
              Zdroj leadů a zobrazení podle platformy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { platform: "Sreality", leads: 45, color: "bg-blue-500" },
                { platform: "Bezrealitky", leads: 28, color: "bg-green-500" },
                { platform: "Facebook", leads: 18, color: "bg-purple-500" },
                { platform: "Web", leads: 9, color: "bg-orange-500" },
              ].map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.platform}</span>
                    <span>{item.leads}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${item.leads}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Konverzní funnel</CardTitle>
          <CardDescription>
            Cesta leadů od prvního kontaktu po prodej
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {[
              { stage: "Zobrazení", count: "1,200", percentage: "100%" },
              { stage: "Kontakt", count: "84", percentage: "7%" },
              { stage: "Prohlídka", count: "42", percentage: "3.5%" },
              { stage: "Nabídka", count: "21", percentage: "1.75%" },
              { stage: "Prodej", count: "12", percentage: "1%" },
            ].map((stage, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full border-2 flex items-center justify-center mb-2">
                  <span className="font-bold">{stage.count}</span>
                </div>
                <p className="font-medium">{stage.stage}</p>
                <p className="text-sm text-muted-foreground">{stage.percentage}</p>
                {index < 4 && (
                  <div className="hidden md:block mt-2">
                    <div className="h-0.5 w-8 bg-muted" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}