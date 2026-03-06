"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Search } from "lucide-react";

type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string;
  status: string;
  budget: number | null;
  notes: string | null;
  assignedTo: { id: string; name: string | null; email: string | null; role: string } | null;
  activitiesCount: number;
  dealsCount: number;
  createdAt: string;
  updatedAt: string;
};

type LeadsResponse = {
  success: boolean;
  data: Lead[];
  pagination: { total: number; limit: number; offset: number; pages: number; currentPage: number; hasNext: boolean; hasPrev: boolean };
  stats: { total: number; new: number; contacted: number; qualified: number; negotiation: number; closed: number; bySource: Record<string, number> };
  filters: { status: string | null; source: string | null; search: string | null };
};

const SOURCE_LABELS: Record<string, string> = {
  WEBSITE: "Web",
  REFERRAL: "Doporučení",
  SOCIAL: "Sociální sítě",
  DIRECT: "Přímý",
};

const STATUS_LABELS: Record<string, string> = {
  NEW: "Nový",
  CONTACTED: "Kontaktován",
  QUALIFIED: "Kvalifikován",
  NEGOTIATION: "Jednání",
  CLOSED: "Uzavřeno",
};

const STATUS_BADGE_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  NEW: "default",
  CONTACTED: "secondary",
  QUALIFIED: "secondary",
  NEGOTIATION: "outline",
  CLOSED: "default",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("cs-CZ", { day: "numeric", month: "short", year: "numeric" });
}

export default function LeadTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadsResponse["stats"] | null>(null);
  const [pagination, setPagination] = useState<LeadsResponse["pagination"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [offset, setOffset] = useState(0);
  const limit = 20;

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("offset", String(offset));
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (sourceFilter) params.set("source", sourceFilter);
      const res = await fetch(`/api/leads?${params.toString()}`, {
        credentials: "same-origin",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Chyba načtení");
        return;
      }
      if (json.success && json.data) {
        setLeads(json.data);
        setStats(json.stats ?? null);
        setPagination(json.pagination ?? null);
      } else {
        setError("Neplatná odpověď API");
      }
    } catch (e) {
      setError(e instanceof Error && e.name === "AbortError" ? "Vypršel čas požadavku" : "Nepodařilo se načíst leady");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setOffset(0);
  }, [search, statusFilter, sourceFilter]);

  useEffect(() => {
    fetchLeads();
  }, [offset, statusFilter, sourceFilter, search]);

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" className="mt-2" onClick={fetchLeads}>
            Zkusit znovu
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Hledat leady (jméno, email, telefon, poznámky)..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                className="border rounded-lg px-3 py-2 bg-background text-sm"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setOffset(0); }}
              >
                <option value="">Všechny statusy</option>
                {Object.entries(STATUS_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
              <select
                className="border rounded-lg px-3 py-2 bg-background text-sm"
                value={sourceFilter}
                onChange={(e) => { setSourceFilter(e.target.value); setOffset(0); }}
              >
                <option value="">Všechny zdroje</option>
                {Object.entries(SOURCE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aktivní leady</CardTitle>
          <CardDescription>
            {stats === null ? "Načítám…" : `Celkem ${stats.total} leadů`} – data z databáze (Prisma)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && leads.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">Načítám leady…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Jméno</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Kontakt</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Zdroj</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Přiřazeno</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Vytvořeno</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{lead.name}</td>
                      <td className="py-3 px-4">
                        <div className="space-y-1 text-sm">
                          {lead.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3 shrink-0" />
                              {lead.email}
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 shrink-0" />
                              {lead.phone}
                            </div>
                          )}
                          {!lead.email && !lead.phone && "—"}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{SOURCE_LABELS[lead.source] ?? lead.source}</td>
                      <td className="py-3 px-4">
                        <Badge variant={STATUS_BADGE_VARIANT[lead.status] ?? "outline"}>
                          {STATUS_LABELS[lead.status] ?? lead.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">{lead.assignedTo?.name ?? "—"}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{formatDate(lead.createdAt)}</td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/crm/${lead.id}`}>Detail</a>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Stránka {pagination.currentPage} / {pagination.pages} ({pagination.total} celkem)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrev}
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                >
                  Předchozí
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNext}
                  onClick={() => setOffset(offset + limit)}
                >
                  Další
                </Button>
              </div>
            </div>
          )}
          {!loading && leads.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Žádné leady nevyhovují filtrům.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
