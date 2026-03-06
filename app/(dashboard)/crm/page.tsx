"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Plus, Loader2, Percent } from "lucide-react";
import LeadTable from "./LeadTable";

type Stats = {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  negotiation: number;
  closed: number;
  bySource: {
    website: number;
    referral: number;
    social: number;
    direct: number;
  };
};

export default function CRMPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleNewLead = () => {
    router.push("/crm/new");
  };

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch("/api/leads?limit=1&offset=0", {
          credentials: "same-origin",
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || "Nepodařilo se načíst statistiky");
        }

        if (data.success && data.stats) {
          setStats(data.stats);
        } else {
          throw new Error("Neplatná odpověď API");
        }
      } catch (err: unknown) {
        console.error("Chyba při načítání statistik:", err);
        const msg = err instanceof Error ? err.message : "Došlo k chybě při načítání statistik";
        setError(err instanceof Error && err.name === "AbortError" ? "Vypršel čas požadavku" : msg);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center page-header">
        <div>
          <h1 className="page-title">CRM</h1>
          <p className="page-subtitle">
            Spravujte své leady a komunikaci s klienty
          </p>
        </div>
        <Button type="button" className="mt-4 md:mt-0" onClick={handleNewLead}>
          <Plus className="h-4 w-4 mr-2" />
          Nový Lead
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Celkem leadů</p>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Načítám...</span>
                  </div>
                ) : error ? (
                  <p className="text-sm text-destructive">Chyba</p>
                ) : (
                  <p className="text-2xl font-bold">{stats?.total ?? 0}</p>
                )}
              </div>
              <Users className="h-8 w-8 text-primary/80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nové</p>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Načítám...</span>
                  </div>
                ) : error ? (
                  <p className="text-sm text-destructive">Chyba</p>
                ) : (
                  <p className="text-2xl font-bold">{stats?.new ?? 0}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Kvalifikované</p>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Načítám...</span>
                  </div>
                ) : error ? (
                  <p className="text-sm text-destructive">Chyba</p>
                ) : (
                  <p className="text-2xl font-bold">{stats?.qualified ?? 0}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Uzavřeno</p>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Načítám...</span>
                  </div>
                ) : error ? (
                  <p className="text-sm text-destructive">Chyba</p>
                ) : (
                  <p className="text-2xl font-bold">{stats?.closed ?? 0}</p>
                )}
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Konverze</p>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Načítám...</span>
                  </div>
                ) : error ? (
                  <p className="text-sm text-destructive">Chyba</p>
                ) : (
                  <p className="text-2xl font-bold">
                    {stats && stats.total > 0 ? ((stats.closed / stats.total) * 100).toFixed(1) : 0}%
                  </p>
                )}
              </div>
              <Percent className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {error && !loading && (
        <div className="mb-6 bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
          Chyba při načítání statistik: {error}
        </div>
      )}

      <LeadTable />

    </div>
  );
}