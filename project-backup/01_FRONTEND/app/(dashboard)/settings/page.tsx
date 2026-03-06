"use client";

import { useState } from "react";
import { SettingsLayout } from "@/components/SettingsLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  CheckCircle, 
  XCircle,
  Globe,
  Download,
  Trash2
} from "lucide-react";

export default function SettingsPage() {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [profile, setProfile] = useState({
    name: "Jan Makléř",
    email: "jan.makler@realforge.ai",
    phone: "+420 777 123 456",
    office: "REALITY KANCELÁŘ s.r.o.",
    role: "Senior Real Estate Agent",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    weeklyReport: true,
    leadAlerts: true,
  });

  const integrations = [
    { 
      name: "Sreality", 
      connected: true, 
      lastSync: "2026-02-08T10:30:00Z",
      logoColor: "bg-orange-500/10",
      textColor: "text-orange-500"
    },
    { 
      name: "Bezrealitky", 
      connected: true, 
      lastSync: "2026-02-08T09:15:00Z",
      logoColor: "bg-blue-500/10",
      textColor: "text-blue-500"
    },
    { 
      name: "Facebook Marketplace", 
      connected: false, 
      lastSync: null,
      logoColor: "bg-purple-500/10",
      textColor: "text-purple-500"
    },
  ];

  const billing = {
    plan: "Pro",
    price: "1,999 Kč/měsíc",
    nextBilling: "2026-03-01",
    storage: "85 GB / 100 GB",
    storageUsed: 85,
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nikdy";
    return new Date(dateString).toLocaleDateString("cs-CZ", {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSave = () => {
    setHasUnsavedChanges(false);
    // Here you would typically save to backend
    console.log("Saving changes...");
  };

  const handleCancel = () => {
    setHasUnsavedChanges(false);
    // Here you would typically reset form state
    console.log("Cancelling changes...");
  };

  const handleInputChange = () => {
    if (!hasUnsavedChanges) {
      setHasUnsavedChanges(true);
    }
  };

  return (
    <SettingsLayout 
      hasUnsavedChanges={hasUnsavedChanges}
      onSave={handleSave}
      onCancel={handleCancel}
    >
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>
            Spravujte své osobní informace a údaje o kanceláři
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Jméno</Label>
                <Input 
                  id="name" 
                  value={profile.name}
                  onChange={(e) => {
                    setProfile({...profile, name: e.target.value});
                    handleInputChange();
                  }}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={profile.email}
                  onChange={(e) => {
                    setProfile({...profile, email: e.target.value});
                    handleInputChange();
                  }}
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  value={profile.phone}
                  onChange={(e) => {
                    setProfile({...profile, phone: e.target.value});
                    handleInputChange();
                  }}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="office">Kancelář</Label>
                <Input 
                  id="office" 
                  value={profile.office}
                  onChange={(e) => {
                    setProfile({...profile, office: e.target.value});
                    handleInputChange();
                  }}
                />
              </div>
              <div>
                <Label htmlFor="role">Pozice</Label>
                <Input 
                  id="role" 
                  value={profile.role}
                  onChange={(e) => {
                    setProfile({...profile, role: e.target.value});
                    handleInputChange();
                  }}
                />
              </div>
              <div className="pt-4">
                <Button onClick={handleSave}>Uložit změny profilu</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Office Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Kancelář</CardTitle>
          <CardDescription>
            Nastavení realitní kanceláře a firemních údajů
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">Název kanceláře</Label>
                <Input 
                  id="companyName" 
                  defaultValue="REALITY KANCELÁŘ s.r.o."
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="ico">IČO</Label>
                <Input 
                  id="ico" 
                  defaultValue="12345678"
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="dic">DIČ</Label>
                <Input 
                  id="dic" 
                  defaultValue="CZ12345678"
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Adresa</Label>
                <Textarea 
                  id="address" 
                  defaultValue="Náměstí Republiky 1, Praha 1"
                  rows={4}
                  onChange={handleInputChange}
                />
              </div>
              <div className="pt-4">
                <Button onClick={handleSave}>Uložit údaje kanceláře</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Card */}
      <Card>
        <CardHeader>
          <CardTitle>Notifikace</CardTitle>
          <CardDescription>
            Spravujte upozornění a oznámení
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {key === 'email' && 'Emailová upozornění'}
                    {key === 'sms' && 'SMS zprávy'}
                    {key === 'push' && 'Push notifikace v aplikaci'}
                    {key === 'weeklyReport' && 'Týdenní reporty'}
                    {key === 'leadAlerts' && 'Upozornění na nové leady'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {key === 'email' && 'Dostávejte upozornění emailem'}
                    {key === 'sms' && 'Důležitá upozornění SMS zprávou'}
                    {key === 'push' && 'Okamžitá upozornění v aplikaci'}
                    {key === 'weeklyReport' && 'Týdenní přehled aktivit'}
                    {key === 'leadAlerts' && 'Okamžité upozornění na nové leady'}
                  </p>
                </div>
                <Switch 
                  checked={value}
                  onCheckedChange={(checked) => {
                    setNotifications({...notifications, [key]: checked});
                    handleInputChange();
                  }}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integrations Card */}
      <Card>
        <CardHeader>
          <CardTitle>Integrace portálů</CardTitle>
          <CardDescription>
            Connect and manage your real estate platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {integrations.map((integration) => (
              <div key={integration.name} className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-lg ${integration.logoColor} flex items-center justify-center`}>
                    <Globe className={`h-6 w-6 ${integration.textColor}`} />
                  </div>
                  <div>
                    <p className="font-medium">{integration.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Poslední synchronizace: {formatDate(integration.lastSync)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {integration.connected ? (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Připojeno
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      <XCircle className="h-3 w-3 mr-1" />
                      Nepřipojeno
                    </Badge>
                  )}
                  <Button variant="outline" size="sm">
                    {integration.connected ? "Spravovat" : "Připojit"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing Card */}
      <Card>
        <CardHeader>
          <CardTitle>Fakturace</CardTitle>
          <CardDescription>
            Informace o předplatném a využití
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-4 rounded-lg border border-border bg-gradient-to-br from-card to-primary/5">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-lg">{billing.plan}</span>
                <Badge className="bg-primary/10 text-primary border-primary/20">Aktivní</Badge>
              </div>
              <p className="text-2xl font-bold mb-1">{billing.price}</p>
              <p className="text-sm text-muted-foreground">
                Další fakturace: {formatDate(billing.nextBilling)}
              </p>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Úložiště</span>
                <span>{billing.storage}</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                  style={{ width: `${billing.storageUsed}%` }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button>Upgradovat plán</Button>
              <Button variant="outline">Spravovat platby</Button>
              <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                Zrušit předplatné
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Card */}
      <Card>
        <CardHeader>
          <CardTitle>Bezpečnost</CardTitle>
          <CardDescription>
            Nastavení zabezpečení účtu a přihlášení
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Změna hesla</h4>
              <div className="space-y-3">
                <Input type="password" placeholder="Současné heslo" />
                <Input type="password" placeholder="Nové heslo" />
                <Input type="password" placeholder="Potvrďte nové heslo" />
              </div>
              <Button className="mt-4">Změnit heslo</Button>
            </div>
            
            <div className="pt-6 border-t">
              <h4 className="font-medium mb-3">Dvoufázové ověření</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Přidejte další vrstvu zabezpečení k vašemu účtu
              </p>
              <Button variant="outline">Nastavit 2FA</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management Card */}
      <Card>
        <CardHeader>
          <CardTitle>Správa dat</CardTitle>
          <CardDescription>
            Export a správa vašich dat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Export dat</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Stáhněte si kopii všech vašich dat v JSON formátu
              </p>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportovat data
              </Button>
            </div>
            
            <div className="pt-6 border-t">
              <h4 className="font-medium mb-3 text-red-500">Nebezpečná zóna</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Smazání účtu je nevratná operace. Všechna vaše data budou odstraněna.
              </p>
              <Button variant="outline" className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10">
                <Trash2 className="h-4 w-4" />
                Smazat účet
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </SettingsLayout>
  );
}
