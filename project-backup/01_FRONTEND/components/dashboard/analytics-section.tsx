"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  DollarSign,
  Clock,
  Target,
  BarChart3,
  Download,
  Calendar,
  Filter,
  RefreshCw
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  description: string;
}

const MetricCard = ({ title, value, change, icon, description }: MetricCardProps) => {
  const isPositive = change >= 0;
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-2 text-foreground">{value}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '↑' : '↓'} {Math.abs(change)}%
              </span>
              <span className="text-xs text-muted-foreground">{description}</span>
            </div>
          </div>
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function AnalyticsSection() {
  // Performance metrics
  const performanceMetrics = [
    {
      title: "Konverzní poměr",
      value: "4.8%",
      change: 12,
      icon: <Target className="h-6 w-6" />,
      description: "vs minulý měsíc"
    },
    {
      title: "Průměrná doba prodeje",
      value: "42 dní",
      change: -8,
      icon: <Clock className="h-6 w-6" />,
      description: "vs minulý měsíc"
    },
    {
      title: "Průměrná komise",
      value: "2.8%",
      change: 5,
      icon: <DollarSign className="h-6 w-6" />,
      description: "vs minulý měsíc"
    },
    {
      title: "Spokojenost klientů",
      value: "4.7/5",
      change: 3,
      icon: <Users className="h-6 w-6" />,
      description: "Hodnocení"
    }
  ];

  // Lead conversion data
  const leadConversionData = [
    { stage: "Zobrazení", count: 10000, conversion: 100 },
    { stage: "Kliknutí", count: 2500, conversion: 25 },
    { stage: "Formulář", count: 500, conversion: 5 },
    { stage: "Kontakt", count: 250, conversion: 2.5 },
    { stage: "Jednání", count: 100, conversion: 1 },
    { stage: "Uzavřeno", count: 48, conversion: 0.48 }
  ];

  // Marketing channels data
  const marketingChannels = [
    { name: "Organic Search", value: 35, color: "#0088FE" },
    { name: "Direct", value: 25, color: "#00C49F" },
    { name: "Social Media", value: 20, color: "#FFBB28" },
    { name: "Email", value: 15, color: "#FF8042" },
    { name: "Referral", value: 5, color: "#8884D8" }
  ];

  // Monthly performance data
  const monthlyPerformance = [
    { month: "Led", listings: 45, leads: 120, deals: 8 },
    { month: "Úno", listings: 52, leads: 145, deals: 10 },
    { month: "Bře", listings: 48, leads: 138, deals: 9 },
    { month: "Dub", listings: 60, leads: 165, deals: 12 },
    { month: "Kvě", listings: 55, leads: 152, deals: 11 },
    { month: "Čer", listings: 65, leads: 180, deals: 14 }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pokročilá Analytics</h2>
          <p className="text-muted-foreground">
            Hluboké analýzy výkonu a konverzí
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Posledních 6 měsíců
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtry
          </Button>
          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export reportu
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            icon={metric.icon}
            description={metric.description}
          />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Konverzní funnel
            </CardTitle>
            <CardDescription>
              Cesta zájemce od zobrazení po uzavření dealu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadConversionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="stage" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    label={{ value: 'Počet', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    name="Počet"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="conversion" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Konverze (%)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-primary/5 rounded-lg">
                <p className="font-medium">Celková konverze</p>
                <p className="text-2xl font-bold text-primary">0.48%</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="font-medium">Nejlepší stage</p>
                <p className="text-2xl font-bold text-green-600">Formulář → Kontakt</p>
                <p className="text-xs text-green-600">50% konverze</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marketing Channels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Marketingové kanály
            </CardTitle>
            <CardDescription>
              Rozdělení podle zdrojů trafficu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={marketingChannels}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {marketingChannels.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Podíl']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">ROI (Return on Investment)</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  +245%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">CPA (Cost per Acquisition)</span>
                <Badge variant="outline">1,245 Kč</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Měsíční výkon</CardTitle>
                <CardDescription>
                  Trendy inzerátů, leadů a dealů
                </CardDescription>
              </div>
              <Button size="sm" variant="ghost">
                <RefreshCw className="h-4 w-4 mr-2" />
                Aktualizovat data
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="listings" 
                    stroke="#0088FE" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Inzeráty"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="leads" 
                    stroke="#00C49F" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Leady"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="deals" 
                    stroke="#FF8042" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Dealy"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-800">Růst inzerátů</p>
                <p className="text-2xl font-bold text-blue-600">+44%</p>
                <p className="text-xs text-blue-600">vs minulé období</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-green-800">Růst leadů</p>
                <p className="text-2xl font-bold text-green-600">+50%</p>
                <p className="text-xs text-green-600">vs minulé období</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="font-medium text-orange-800">Růst dealů</p>
                <p className="text-2xl font-bold text-orange-600">+75%</p>
                <p className="text-xs text-orange-600">vs minulé období</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* A/B Testing Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            A/B Testy inzerátů
          </CardTitle>
          <CardDescription>
            Výsledky testování různých verzí inzerátů
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Test</th>
                  <th className="text-left py-3 px-4 font-medium">Varianta A</th>
                  <th className="text-left py-3 px-4 font-medium">Varianta B</th>
                  <th className="text-left py-3 px-4 font-medium">Vítěz</th>
                  <th className="text-left py-3 px-4 font-medium">Zvýšení</th>
                  <th className="text-left py-3 px-4 font-medium">Důvěra</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-accent/50">
                  <td className="py-3 px-4">Titul inzerátu</td>
                  <td className="py-3 px-4">"Luxusní byt Praha 1"</td>
                  <td className="py-3 px-4">"Byt s výhledem na hrad"</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-green-100 text-green-800">B</Badge>
                  </td>
                  <td className="py-3 px-4 font-medium">+23% kliků</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="bg-blue-50">95%</Badge>
                  </td>
                </tr>
                <tr className="border-b hover:bg-accent/50">
                  <td className="py-3 px-4">Cena zobrazení</td>
                  <td className="py-3 px-4">12.500.000 Kč</td>
                  <td className="py-3 px-4">12.490.000 Kč</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-green-100 text-green-800">B</Badge>
                  </td>
                  <td className="py-3 px-4 font-medium">+15% zájemců</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="bg-blue-50">89%</Badge>
                  </td>
                </tr>
                <tr className="border-b hover:bg-accent/50">
                  <td className="py-3 px-4">Hlavní fotka</td>
                  <td className="py-3 px-4">Exteriér</td>
                  <td className="py-3 px-4">Interiér (obývák)</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-green-100 text-green-800">B</Badge>
                  </td>
                  <td className="py-3 px-4 font-medium">+42% zobrazení</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="bg-blue-50">98%</Badge>
                  </td>
                </tr>
                <tr className="hover:bg-accent/50">
                  <td className="py-3 px-4">Popis</td>
                  <td className="py-3 px-4">Krátký (50 slov)</td>
                  <td className="py-3 px-4">Detailní (150 slov)</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-green-100 text-green-800">B</Badge>
                  </td>
                  <td className="py-3 px-4 font-medium">+18% kontaktů</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="bg-blue-50">92%</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Testy běží automaticky na všech nových inzerátech
            </p>
            <Button size="sm" variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Zobrazit všechny testy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            AI Doporučení
          </CardTitle>
          <CardDescription>
            Optimalizace na základě datové analýzy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">🎯 Zvýšení konverze</h4>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-500"></div>
                    Přidejte video prohlídku (+37% konverze)
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-500"></div>
                    Optimalizujte ceny pomocí AI (+23% zájemců)
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-500"></div>
                    Zkraťte dobu odpovědi na 1 hodinu (+45% dealů)
                  </li>
                </ul>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">💰 Optimalizace komisí</h4>
                <ul className="space-y-2 text-sm text-green-700">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-green-500"></div>
                    Zaměřte se na nemovitosti nad 10M Kč (+2.1% komise)
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-green-500"></div>
                    Nabízejte doplňkové služby (+15% příjmů)
                  </li>
                </ul>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">📈 Marketing</h4>
                <ul className="space-y-2 text-sm text-purple-700">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-purple-500"></div>
                    Zvyšte rozpočet na Facebook Ads (+65% leadů)
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-purple-500"></div>
                    Spusťte retargeting kampaň (+32% konverze)
                  </li>
                </ul>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-800 mb-2">⚡ Rychlé akce</h4>
                <ul className="space-y-2 text-sm text-orange-700">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-orange-500"></div>
                    Aktualizujte 5 starších inzerátů
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-orange-500"></div>
                    Kontaktujte 10 neaktivních leadů
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-orange-500"></div>
                    Naplánujte A/B test pro příští týden
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
