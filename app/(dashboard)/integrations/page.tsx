import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Key, Database, Mail, BarChart, CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { IntegrationTestButton } from "@/components/IntegrationTestButton";

export default function IntegrationsPage() {
  const integrations = [
    {
      id: "1",
      name: "DeepSeek AI",
      description: "AI analýza fotek a generování popisů",
      icon: Globe,
      status: "connected",
      lastSync: "2026-02-23T14:30:00Z",
      category: "AI",
      configUrl: "/settings/integrations",
    },
    {
      id: "2",
      name: "Poski REAL",
      description: "Realitní CRM a databáze nemovitostí",
      icon: Database,
      status: "connected",
      lastSync: "2026-02-23T15:45:00Z",
      category: "CRM",
      configUrl: "#",
    },
    {
      id: "3",
      name: "Google Analytics",
      description: "Sledování návštěvnosti a konverzí",
      icon: BarChart,
      status: "pending",
      lastSync: "—",
      category: "Analytics",
      configUrl: "#",
    },
    {
      id: "4",
      name: "Email Service",
      description: "Emailové notifikace a kampaně",
      icon: Mail,
      status: "disconnected",
      lastSync: "2026-02-20T10:20:00Z",
      category: "Communication",
      configUrl: "#",
    },
    {
      id: "5",
      name: "Payment Gateway",
      description: "Platby a fakturace",
      icon: CreditCard,
      status: "connected",
      lastSync: "2026-02-23T16:00:00Z",
      category: "Finance",
      configUrl: "/settings/billing",
    },
    {
      id: "6",
      name: "API Gateway",
      description: "Centrální správa API klíčů",
      icon: Key,
      status: "connected",
      lastSync: "2026-02-23T17:30:00Z",
      category: "Infrastructure",
      configUrl: "/settings/integrations",
    },
  ];

  const formatDate = (dateString: string) => {
    if (dateString === "—") return "—";
    return new Date(dateString).toLocaleDateString("cs-CZ", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Připojeno
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            <Clock className="h-3 w-3 mr-1" />
            Čeká
          </Badge>
        );
      case "disconnected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700">
            <XCircle className="h-3 w-3 mr-1" />
            Odpojeno
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const categories = [...new Set(integrations.map(i => i.category))];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrace</h1>
          <p className="text-muted-foreground mt-2">
            Spravujte připojení k externím službám a API
          </p>
        </div>
        <Link href="/settings">
          <Button className="mt-4 md:mt-0">
            <Globe className="h-4 w-4 mr-2" />
            Přidat integraci
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Celkem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{integrations.length}</div>
            <p className="text-sm text-muted-foreground">integrací</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Aktivní</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {integrations.filter(i => i.status === "connected").length}
            </div>
            <p className="text-sm text-muted-foreground">připojeno</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Čeká</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {integrations.filter(i => i.status === "pending").length}
            </div>
            <p className="text-sm text-muted-foreground">na konfiguraci</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Problémy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {integrations.filter(i => i.status === "disconnected").length}
            </div>
            <p className="text-sm text-muted-foreground">odpojeno</p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Button variant="outline" size="sm" className="rounded-full">
          Všechny
        </Button>
        {categories.map(category => (
          <Button key={category} variant="outline" size="sm" className="rounded-full">
            {category}
          </Button>
        ))}
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <Card key={integration.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <CardDescription>{integration.category}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(integration.status)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {integration.description}
                </p>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stav:</span>
                    <span className="font-medium">
                      {integration.status === "connected" ? "Aktivní" : 
                       integration.status === "pending" ? "Čeká" : "Odpojeno"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Poslední synchronizace:</span>
                    <span className="font-medium">{formatDate(integration.lastSync)}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Link href={integration.configUrl} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      Nastavení
                    </Button>
                  </Link>
                  <IntegrationTestButton integrationId={integration.id} name={integration.name} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {integrations.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Žádné integrace</h3>
            <p className="text-muted-foreground mb-6">
              Přidejte svou první integraci pro propojení s externími službami
            </p>
            <Link href="/settings">
              <Button>
                <Globe className="h-4 w-4 mr-2" />
                Přidat integraci
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Documentation */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Dokumentace API</CardTitle>
          <CardDescription>
            Technické informace a API reference pro vývojáře
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">REST API</h4>
              <p className="text-sm text-muted-foreground">
                Kompletní REST API pro integraci s vašimi systémy
              </p>
              <Button variant="outline" size="sm">
                Zobrazit dokumentaci
              </Button>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Webhooky</h4>
              <p className="text-sm text-muted-foreground">
                Konfigurace webhooků pro real-time notifikace
              </p>
              <Button variant="outline" size="sm">
                Nastavit webhooky
              </Button>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">SDK</h4>
              <p className="text-sm text-muted-foreground">
                Klientské knihovny pro JavaScript, Python a další
              </p>
              <Button variant="outline" size="sm">
                Stáhnout SDK
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}