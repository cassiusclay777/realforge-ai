"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Globe,
  Mail,
  CreditCard,
  Share2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  ExternalLink
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'disconnected' | 'pending';
  lastSync?: string;
  actions: string[];
}

export default function IntegrationsSection() {
  const integrations: Integration[] = [
    {
      id: "1",
      name: "Sreality.cz",
      description: "Automatické zveřejňování inzerátů",
      icon: <Globe className="h-6 w-6" />,
      status: 'connected',
      lastSync: "Před 2 hodinami",
      actions: ["Auto-publish", "Sync leads", "Analytics"]
    },
    {
      id: "2",
      name: "Bezrealitky.cz",
      description: "Integrace s českým portálem",
      icon: <Globe className="h-6 w-6" />,
      status: 'connected',
      lastSync: "Před 1 hodinou",
      actions: ["Auto-publish", "Lead capture"]
    },
    {
      id: "3",
      name: "Mailchimp",
      description: "Email marketing automation",
      icon: <Mail className="h-6 w-6" />,
      status: 'connected',
      lastSync: "Před 30 minutami",
      actions: ["Newsletters", "Campaigns", "Segments"]
    },
    {
      id: "4",
      name: "FinGO API",
      description: "Finanční analýzy a kalkulace",
      icon: <CreditCard className="h-6 w-6" />,
      status: 'pending',
      lastSync: "Čeká na připojení",
      actions: ["Mortgage calc", "Affordability", "Reports"]
    },
    {
      id: "5",
      name: "Social Media",
      description: "Automatické sdílení na sociální sítě",
      icon: <Share2 className="h-6 w-6" />,
      status: 'disconnected',
      lastSync: "Nepřipojeno",
      actions: ["Facebook", "LinkedIn", "Instagram"]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'disconnected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'disconnected': return <XCircle className="h-4 w-4" />;
      case 'pending': return <RefreshCw className="h-4 w-4" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Připojeno';
      case 'disconnected': return 'Odpojeno';
      case 'pending': return 'Čeká';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Integrace</h2>
          <p className="text-muted-foreground">
            Propojte své nástroje pro automatizaci workflow
          </p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Spravovat integrace
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {integration.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                  </div>
                </div>
                <Badge className={`flex items-center gap-1 ${getStatusColor(integration.status)}`}>
                  {getStatusIcon(integration.status)}
                  {getStatusText(integration.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Poslední synchronizace:</span>
                  <span className="font-medium">{integration.lastSync}</span>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Dostupné akce:</p>
                  <div className="flex flex-wrap gap-2">
                    {integration.actions.map((action, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {action}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  {integration.status === 'connected' ? (
                    <>
                      <Button size="sm" variant="outline" className="flex-1">
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Synchronizovat
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </>
                  ) : integration.status === 'pending' ? (
                    <Button size="sm" className="flex-1">
                      Dokončit připojení
                    </Button>
                  ) : (
                    <Button size="sm" variant="default" className="flex-1">
                      Připojit
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            API Dokumentace
          </CardTitle>
          <CardDescription>
            Vlastní integrace pomocí REST API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Endpoints</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <code className="bg-muted px-2 py-1 rounded">GET /api/listings</code>
                  <Badge variant="outline">Public</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <code className="bg-muted px-2 py-1 rounded">POST /api/leads</code>
                  <Badge variant="outline">Private</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <code className="bg-muted px-2 py-1 rounded">GET /api/analytics</code>
                  <Badge variant="outline">Private</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">API Klíč</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Aktivní klíč:</span>
                  <Badge variant="secondary">••••••••••••••••</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Použití:</span>
                  <Badge variant="outline">1,245 requests</Badge>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  Vygenerovat nový klíč
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Rychlé akce</h4>
              <div className="space-y-2">
                <Button size="sm" variant="outline" className="w-full justify-start">
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Zobrazit dokumentaci
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start">
                  <Download className="h-3 w-3 mr-2" />
                  Stáhnout Postman kolekci
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start">
                  <Code className="h-3 w-3 mr-2" />
                  Příklady kódu
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Missing imports
import { Download, Code } from "lucide-react";