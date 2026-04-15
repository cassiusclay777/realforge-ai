"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, User, AlertCircle, UserPlus } from "lucide-react";

function mapCredentialsSignInError(error: string | undefined): string {
  if (!error) return "Automatické přihlášení po registraci selhalo.";
  if (error === "CredentialsSignin") {
    return "Přihlášení selhalo (zkuste se přihlásit ručně na přihlašovací stránce).";
  }
  return error;
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [providerIds, setProviderIds] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/auth/providers")
      .then((r) => r.json())
      .then((data: Record<string, unknown>) => setProviderIds(Object.keys(data || {})))
      .catch(() => setProviderIds(["credentials"]));
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validace
    if (password !== confirmPassword) {
      setError("Hesla se neshodují");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Heslo musí mít alespoň 8 znaků");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const raw = await response.text();
      let data: { error?: string } = {};
      try {
        data = raw ? (JSON.parse(raw) as { error?: string }) : {};
      } catch {
        if (response.ok) {
          throw new Error(
            `Server vrátil neplatnou odpověď (HTTP ${response.status}). Běží Postgres a migrace?`
          );
        }
      }

      if (!response.ok) {
        throw new Error(data.error || `Registrace selhala (HTTP ${response.status})`);
      }

      // Automatické přihlášení po registraci
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(mapCredentialsSignInError(result.error));
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Nastala chyba při registraci");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err) {
      setError("Nastala chyba při registraci přes Google");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Registrace do REALFORGE AI
          </CardTitle>
          <CardDescription className="text-center">
            Vytvořte si účet a začněte používat AI realitní engine
          </CardDescription>
          {process.env.NODE_ENV === "development" && (
            <p className="text-center text-xs text-muted-foreground px-2">
              Pokud registrace padá na DB, spusť{" "}
              <span className="font-mono">npx prisma migrate deploy</span> a měj rozjetý Postgres z{" "}
              <span className="font-mono">docker-compose</span>. Stálý demo účet:{" "}
              <span className="font-mono">demo@realforge.ai</span> / <span className="font-mono">demo12345</span>.
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success ? (
            <Alert className="bg-green-50 border-green-200">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Účet byl úspěšně vytvořen! Přesměrování na dashboard...
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Jméno a příjmení</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Jan Novák"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="vas@email.cz"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Heslo</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Minimálně 8 znaků
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Potvrzení hesla</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Registrace..." : "Zaregistrovat se"}
                  <UserPlus className="ml-2 h-4 w-4" />
                </Button>
              </form>

              {providerIds.includes("google") && (
              <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    nebo
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleRegister}
                disabled={isLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Registrovat se přes Google
              </Button>
              </>
              )}
            </>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Již máte účet?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Přihlaste se
            </Link>
          </div>
          <div className="text-center text-xs text-muted-foreground">
            Registrací souhlasíte s{" "}
            <Link href="/terms" className="hover:underline">
              podmínkami služby
            </Link>{" "}
            a{" "}
            <Link href="/privacy" className="hover:underline">
              ochranou osobních údajů
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}