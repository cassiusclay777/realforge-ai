"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { CheckCircle, XCircle, Shield, Lock, Smartphone, LogOut, Eye, EyeOff, Key, UserCheck } from "lucide-react";
import { SettingsLayout } from "@/components/SettingsLayout";

export default function SecurityPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [activeSessions, setActiveSessions] = useState([
    { id: "1", device: "Windows Chrome", location: "Praha, CZ", lastActive: "2026-02-24 08:05", current: true },
    { id: "2", device: "iPhone Safari", location: "Brno, CZ", lastActive: "2026-02-23 22:15", current: false },
    { id: "3", device: "MacBook Firefox", location: "Ostrava, CZ", lastActive: "2026-02-22 14:30", current: false },
  ]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleChangePassword = () => {
    if (!passwordForm.currentPassword) {
      setMessage({ type: "error", text: "Zadejte aktuální heslo" });
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      setMessage({ type: "error", text: "Nové heslo musí mít alespoň 8 znaků" });
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "Hesla se neshodují" });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    
    // Simulace API volání
    setTimeout(() => {
      setMessage({ type: "success", text: "Heslo bylo úspěšně změněno" });
      setIsLoading(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }, 1500);
  };

  const handleToggle2FA = () => {
    setIsLoading(true);
    setMessage(null);
    
    // Simulace API volání
    setTimeout(() => {
      setTwoFactorEnabled(!twoFactorEnabled);
      setMessage({ 
        type: "success", 
        text: twoFactorEnabled 
          ? "Dvoufaktorové ověření bylo vypnuto" 
          : "Dvoufaktorové ověření bylo zapnuto" 
      });
      setIsLoading(false);
    }, 1500);
  };

  const handleLogoutSession = (sessionId: string) => {
    if (!confirm("Opravdu chcete odhlásit toto zařízení?")) {
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    
    // Simulace API volání
    setTimeout(() => {
      setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
      setMessage({ type: "success", text: "Zařízení bylo odhlášeno" });
      setIsLoading(false);
    }, 1000);
  };

  const handleLogoutAll = () => {
    if (!confirm("Opravdu chcete odhlásit všechna zařízení kromě tohoto?")) {
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    
    // Simulace API volání
    setTimeout(() => {
      setActiveSessions(prev => prev.filter(session => session.current));
      setMessage({ type: "success", text: "Všechna ostatní zařízení byla odhlášena" });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bezpečnost</h1>
          <p className="text-muted-foreground">
            Spravujte heslo, dvoufaktorové ověření a aktivní relace
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

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Změna hesla
            </CardTitle>
            <CardDescription>
              Změňte si heslo pro zvýšení bezpečnosti účtu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Aktuální heslo</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Zadejte aktuální heslo"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nové heslo</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Zadejte nové heslo (min. 8 znaků)"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Heslo musí obsahovat alespoň 8 znaků, jedno velké písmeno a jedno číslo
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Potvrzení nového hesla</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Znovu zadejte nové heslo"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleChangePassword} 
              disabled={isLoading}
              className="gap-2"
            >
              <Key className="h-4 w-4" />
              Změnit heslo
            </Button>
          </CardContent>
        </Card>

        {/* Two-Factor Authentication */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Dvoufaktorové ověření (2FA)
                </CardTitle>
                <CardDescription>
                  Přidejte další vrstvu zabezpečení k vašemu účtu
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={twoFactorEnabled ? "default" : "outline"} className={twoFactorEnabled ? "bg-green-50 text-green-700" : ""}>
                  {twoFactorEnabled ? "Aktivní" : "Neaktivní"}
                </Badge>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={handleToggle2FA}
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Jak 2FA funguje</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Po přihlášení budete vyzváni k zadání kódu z vašeho telefonu</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Kódy se generují každých 30 sekund v autentizační aplikaci</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Zabezpečí váš účet i v případě odcizení hesla</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Doporučené aplikace</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Google Authenticator</span>
                      <Badge variant="outline">Doporučeno</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Authy</span>
                      <Badge variant="outline">Zálohování</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Microsoft Authenticator</span>
                      <Badge variant="outline">Windows</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {twoFactorEnabled && (
              <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <UserCheck className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800">2FA je aktivní</h4>
                    <p className="text-sm text-green-700">
                      Dvoufaktorové ověření chrání váš účet. Při každém přihlášení budete potřebovat kód z autentizační aplikace.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" disabled={!twoFactorEnabled || isLoading}>
                Zobrazit záložní kódy
              </Button>
              <Button variant="outline" disabled={!twoFactorEnabled || isLoading}>
                Nastavit nové zařízení
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5" />
              Aktivní relace
            </CardTitle>
            <CardDescription>
              Přehled zařízení, která jsou aktuálně přihlášena k vašemu účtu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${session.current ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                      {session.current ? (
                        <Shield className="h-5 w-5" />
                      ) : (
                        <Smartphone className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {session.device}
                        {session.current && (
                          <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">
                            Aktuální
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {session.location} • {session.lastActive}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {!session.current && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleLogoutSession(session.id)}
                        disabled={isLoading}
                      >
                        Odhlásit
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between items-center p-4 border rounded-lg bg-muted">
              <div>
                <h4 className="font-medium">Odhlásit všechna zařízení</h4>
                <p className="text-sm text-muted-foreground">
                  Odhlásí všechna zařízení kromě tohoto. Budete se muset znovu přihlásit na všech ostatních zařízeních.
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogoutAll}
                disabled={isLoading}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Odhlásit vše
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Audit */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Bezpečnostní audit
            </CardTitle>
            <CardDescription>
              Přehled bezpečnostních opatření vašeho účtu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">Silné heslo</div>
                    <div className="text-sm text-muted-foreground">Heslo bylo změněno před 30 dny</div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  OK
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">Dvoufaktorové ověření</div>
                    <div className="text-sm text-muted-foreground">
                      {twoFactorEnabled ? "Aktivní" : "Neaktivní"}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className={twoFactorEnabled ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}>
                  {twoFactorEnabled ? "OK" : "Doporučeno"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">Aktivní relace</div>
                    <div className="text-sm text-muted-foreground">
                      {activeSessions.length} zařízení
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  OK
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">Poslední přihlášení</div>
                    <div className="text-sm text-muted-foreground">
                      Dnes v 08:05 z Prahy
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  Normální
                </Badge>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">Bezpečnostní doporučení</h4>
                  <p className="text-sm text-muted-foreground">
                    • Pravidelně měňte heslo každých 90 dní<br />
                    • Aktivujte dvoufaktorové ověření pro vyšší zabezpečení<br />
                    • Kontrolujte aktivní relace a odhlašujte neznámá zařízení
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
}
