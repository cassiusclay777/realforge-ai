"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, Key } from "lucide-react";
import { SettingsLayout } from "@/components/SettingsLayout";

interface IntegrationConfig {
  deepseekApiKey?: string;
  deepseekApiKeyConfigured: boolean;
  lastTested?: string;
  testStatus?: "success" | "error" | "pending";
  testMessage?: string;
}

const PLACEHOLDER_MASK = "••••••••••••••••";

export default function IntegrationsPage() {
  const [config, setConfig] = useState<IntegrationConfig>({
    deepseekApiKeyConfigured: false,
  });
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch("/api/settings/integrations");
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        if (data.deepseekApiKeyConfigured) {
          setApiKey(PLACEHOLDER_MASK);
        }
      }
    } catch (error) {
      console.error("Chyba při načítání konfigurace:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const keyToSave = apiKey.trim();
    if (!keyToSave || keyToSave === PLACEHOLDER_MASK) {
      setMessage({ type: "error", text: "Zadejte prosím nový API klíč (nebo vymažte pole a zadejte znovu)" });
      return;
    }
    saveApiKey(keyToSave);
  };

  const saveApiKey = async (keyToSave: string) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/settings/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deepseekApiKey: keyToSave }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "API klíč byl úspěšně uložen" });
        setConfig(data);
        setApiKey(PLACEHOLDER_MASK);
      } else {
        setMessage({ type: "error", text: data.error || "Chyba při ukládání API klíče" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Chyba při ukládání API klíče" });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: data.message || "Připojení k DeepSeek API bylo úspěšné" });
        setConfig(prev => ({
          ...prev,
          lastTested: new Date().toISOString(),
          testStatus: "success",
          testMessage: data.message,
        }));
      } else {
        setMessage({ type: "error", text: data.error || "Chyba při testování připojení" });
        setConfig(prev => ({
          ...prev,
          lastTested: new Date().toISOString(),
          testStatus: "error",
          testMessage: data.error,
        }));
      }
    } catch (error) {
      setMessage({ type: "error", text: "Chyba při testování připojení" });
      setConfig(prev => ({
        ...prev,
        lastTested: new Date().toISOString(),
        testStatus: "error",
        testMessage: "Network error",
      }));
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrace</h1>
          <p className="text-muted-foreground">
            Spravujte API integrace a externí služby
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              DeepSeek AI API
            </CardTitle>
            <CardDescription>
              Konfigurace API klíče pro DeepSeek AI službu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-amber-500/50 bg-amber-500/5">
              <AlertDescription>
                Pro zpracování fotek ve workeru (upload ZIP → AI analýza) nastavte <code className="rounded bg-muted px-1">DEEPSEEK_API_KEY</code> v souboru <code className="rounded bg-muted px-1">.env.local</code> v kořeni projektu a restartujte aplikaci včetně workeru (<code className="rounded bg-muted px-1">npm run dev</code>). Klíč uložený zde slouží jen pro testování připojení z prohlížeče.
              </AlertDescription>
            </Alert>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Klíč</Label>
                <Input
                  id="apiKey"
                  type="password"
                  autoComplete="off"
                  placeholder="Zadejte váš DeepSeek API klíč"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  {apiKey === PLACEHOLDER_MASK
                    ? "Klíč je uložen. Pro změnu vymažte pole a zadejte nový klíč, pak Uložit."
                    : "API klíč je uložen šifrovaně a používá se pro komunikaci s DeepSeek API (včetně workeru)."}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isLoading || !apiKey.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ukládání...
                    </>
                  ) : (
                    "Uložit API klíč"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={testConnection}
                  disabled={isTesting || !config.deepseekApiKeyConfigured}
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testování...
                    </>
                  ) : (
                    "Testovat připojení"
                  )}
                </Button>
              </div>
            </form>

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

            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Stav integrace</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">API klíč nakonfigurován:</span>
                  <span className={config.deepseekApiKeyConfigured ? "text-green-600 font-medium" : "text-amber-600 font-medium"}>
                    {config.deepseekApiKeyConfigured ? "Ano" : "Ne"}
                  </span>
                </div>
                {config.lastTested && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Naposledy testováno:</span>
                    <span>{new Date(config.lastTested).toLocaleString("cs-CZ")}</span>
                  </div>
                )}
                {config.testStatus && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stav testu:</span>
                    <span className={config.testStatus === "success" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      {config.testStatus === "success" ? "Úspěšné" : "Chyba"}
                    </span>
                  </div>
                )}
                {config.testMessage && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Zpráva:</span>
                    <span className="text-muted-foreground">{config.testMessage}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-medium mb-2">Jak získat API klíč:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Navštivte <a href="https://platform.deepseek.com/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">DeepSeek Platform</a></li>
                <li>Vytvořte si účet nebo se přihlaste</li>
                <li>Přejděte do sekce API Keys</li>
                <li>Vytvořte nový API klíč</li>
                <li>Zkopírujte klíč a vložte ho do formuláře výše</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Další integrace</CardTitle>
            <CardDescription>
              Další plánované integrace a služby
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Poski REAL</h4>
                  <p className="text-sm text-muted-foreground">Integrace s realitním systémem</p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Aktivní</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Google Analytics</h4>
                  <p className="text-sm text-muted-foreground">Sledování návštěvnosti</p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">Plánováno</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">Emailové notifikace</p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">Plánováno</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
}