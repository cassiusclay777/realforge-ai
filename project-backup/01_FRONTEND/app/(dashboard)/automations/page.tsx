import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bot, Zap, Clock, CheckCircle, XCircle, Settings } from "lucide-react";

export default function AutomationsPage() {
  const automations = [
    {
      id: "1",
      name: "Automatické tagování fotek",
      description: "AI automaticky analyzuje fotky a přidává tagy",
      status: "active",
      lastRun: "2026-02-23T14:30:00Z",
      nextRun: "2026-02-24T02:00:00Z",
      triggers: ["NOVÁ_FOTKA", "MANUÁLNÍ_SPUŠTĚNÍ"],
    },
    {
      id: "2",
      name: "Generování popisů",
      description: "AI generuje popisy nemovitostí z fotek",
      status: "active",
      lastRun: "2026-02-23T15:45:00Z",
      nextRun: "2026-02-24T03:00:00Z",
      triggers: ["NOVÝ_LISTING", "MANUÁLNÍ_SPUŠTĚNÍ"],
    },
    {
      id: "3",
      name: "Cenové doporučení",
      description: "AI analyzuje trh a doporučuje ceny",
      status: "paused",
      lastRun: "2026-02-22T10:20:00Z",
      nextRun: "—",
      triggers: ["NOVÝ_LISTING", "ZMĚNA_TRHU"],
    },
    {
      id: "4",
      name: "Export do portálů",
      description: "Automatický export listingů na realitní portály",
      status: "active",
      lastRun: "2026-02-23T16:00:00Z",
      nextRun: "2026-02-24T04:00:00Z",
      triggers: ["PUBLIKOVANÝ_LISTING", "MANUÁLNÍ_SPUŠTĚNÍ"],
    },
    {
      id: "5",
      name: "Notifikace klientů",
      description: "Automatické upozornění klientů na nové nabídky",
      status: "inactive",
      lastRun: "—",
      nextRun: "—",
      triggers: ["NOVÝ_LISTING", "ZMĚNA_CENY"],
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
      case "active":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Aktivní
          </Badge>
        );
      case "paused":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            <Clock className="h-3 w-3 mr-1" />
            Pozastaveno
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700">
            <XCircle className="h-3 w-3 mr-1" />
            Neaktivní
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automatizace</h1>
          <p className="text-muted-foreground mt-2">
            Spravujte automatické procesy a AI workflow
          </p>
        </div>
        <Button className="mt-4 md:mt-0">
          <Zap className="h-4 w-4 mr-2" />
          Nová automatizace
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Aktivní</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
            <p className="text-sm text-muted-foreground">z 5 automatizací</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Spuštěno dnes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-sm text-muted-foreground">běžících procesů</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Úspora času</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8.5h</div>
            <p className="text-sm text-muted-foreground">tento týden</p>
          </CardContent>
        </Card>
      </div>

      {/* Automations List */}
      <div className="space-y-6">
        {automations.map((automation) => (
          <Card key={automation.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Bot className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>{automation.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {automation.description}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {automation.triggers.map((trigger, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {trigger.replace("_", " ").toLowerCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getStatusBadge(automation.status)}
                  <Switch checked={automation.status === "active"} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Poslední spuštění:</span>
                  <span className="font-medium">{formatDate(automation.lastRun)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Další spuštění:</span>
                  <span className="font-medium">{formatDate(automation.nextRun)}</span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Nastavení
                </Button>
                <Button variant="outline" size="sm">
                  Spustit nyní
                </Button>
                <Button variant="outline" size="sm">
                  Historie
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {automations.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Žádné automatizace</h3>
            <p className="text-muted-foreground mb-6">
              Vytvořte svou první automatizaci pro úsporu času
            </p>
            <Button>
              <Zap className="h-4 w-4 mr-2" />
              Vytvořit automatizaci
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}