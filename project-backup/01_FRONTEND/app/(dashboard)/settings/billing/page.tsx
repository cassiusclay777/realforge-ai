"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, CreditCard, DollarSign, Download, Receipt, Shield, XCircle } from "lucide-react";
import { SettingsLayout } from "@/components/SettingsLayout";

export default function BillingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const currentPlan = {
    name: "Pro Plan",
    price: "1,999 Kč",
    period: "měsíčně",
    status: "active",
    nextBillingDate: "2026-03-24",
    features: [
      "Neomezené listy nemovitostí",
      "AI analýza fotek",
      "CRM systém",
      "Export do portálů",
      "Prioritní support",
    ],
  };

  const invoices = [
    { id: "INV-2026-002", date: "2026-02-01", amount: "1,999 Kč", status: "paid" },
    { id: "INV-2026-001", date: "2026-01-01", amount: "1,999 Kč", status: "paid" },
    { id: "INV-2025-012", date: "2025-12-01", amount: "1,999 Kč", status: "paid" },
  ];

  const paymentMethods = [
    { id: "1", type: "card", last4: "4242", brand: "Visa", expiry: "12/26", isDefault: true },
    { id: "2", type: "card", last4: "8888", brand: "Mastercard", expiry: "08/25", isDefault: false },
  ];

  const handleUpgrade = () => {
    setIsLoading(true);
    setMessage(null);
    
    // Simulace API volání
    setTimeout(() => {
      setMessage({ type: "success", text: "Plán byl úspěšně upgradován na Enterprise" });
      setIsLoading(false);
    }, 1500);
  };

  const handleCancel = () => {
    if (!confirm("Opravdu chcete zrušit předplatné? Po zrušení ztratíte přístup k prémiovým funkcím.")) {
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    
    // Simulace API volání
    setTimeout(() => {
      setMessage({ type: "error", text: "Předplatné bylo zrušeno. Platí do 2026-03-24." });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fakturace</h1>
          <p className="text-muted-foreground">
            Spravujte předplatné, faktury a platební metody
          </p>
        </div>

        {message && (
          <Alert variant={message.type === "success" ? "default" : "destructive"}>
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Current Plan */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Aktuální plán
                </CardTitle>
                <CardDescription>
                  {currentPlan.name} • {currentPlan.price} {currentPlan.period}
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Aktivní
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Funkce plánu</h3>
                <ul className="space-y-2">
                  {currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Další fakturace:</span>
                  <span className="font-medium">{currentPlan.nextBillingDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stav účtu:</span>
                  <span className="font-medium text-green-600">Aktivní</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Členství od:</span>
                  <span className="font-medium">2025-01-15</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleUpgrade} disabled={isLoading}>
                Upgrade na Enterprise
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                Zrušit předplatné
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Platební metody
            </CardTitle>
            <CardDescription>
              Spravujte kreditní karty a další platební metody
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {method.brand} •••• {method.last4}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Platí do {method.expiry}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {method.isDefault && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      Výchozí
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm">
                    Upravit
                  </Button>
                  {!method.isDefault && (
                    <Button variant="ghost" size="sm">
                      Odstranit
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Přidat platební metodu</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Číslo karty</Label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Platnost</Label>
                    <Input id="expiry" placeholder="MM/RR" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="123" />
                  </div>
                </div>
              </div>
              <Button className="mt-4">
                <CreditCard className="h-4 w-4 mr-2" />
                Přidat kartu
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Faktury
            </CardTitle>
            <CardDescription>
              Historie faktur a plateb
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{invoice.id}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(invoice.date).toLocaleDateString("cs-CZ")}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="font-bold">{invoice.amount}</div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Zaplaceno
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Stáhnout
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">Bezpečnost plateb</h4>
                  <p className="text-sm text-muted-foreground">
                    Všechny platby jsou šifrované a zpracovávány přes certifikovaného poskytovatele plateb.
                    Nikdy neukládáme čísla vašich karet.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Information */}
        <Card>
          <CardHeader>
            <CardTitle>Fakturační údaje</CardTitle>
            <CardDescription>
              Kontaktní a fakturační informace pro vaši společnost
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Název společnosti</Label>
                  <Input id="companyName" defaultValue="Realitní kancelář s.r.o." />
                </div>
                <div>
                  <Label htmlFor="vat">IČO</Label>
                  <Input id="vat" defaultValue="12345678" />
                </div>
                <div>
                  <Label htmlFor="address">Adresa</Label>
                  <Input id="address" defaultValue="Václavské náměstí 1, Praha 1" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email pro faktury</Label>
                  <Input id="email" defaultValue="fakturace@realitnikancelar.cz" />
                </div>
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" defaultValue="+420 123 456 789" />
                </div>
                <div className="pt-4">
                  <Button>Uložit změny</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
}