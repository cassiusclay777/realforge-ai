"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const SOURCE_OPTIONS = [
  { value: "WEBSITE", label: "Web" },
  { value: "REFERRAL", label: "Doporučení" },
  { value: "SOCIAL", label: "Sociální sítě" },
  { value: "DIRECT", label: "Přímý" },
];

const STATUS_OPTIONS = [
  { value: "NEW", label: "Nový" },
  { value: "CONTACTED", label: "Kontaktován" },
  { value: "QUALIFIED", label: "Kvalifikován" },
  { value: "NEGOTIATION", label: "Jednání" },
  { value: "CLOSED", label: "Uzavřeno" },
];

export default function NewLeadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    source: "WEBSITE",
    status: "NEW",
    budget: "",
    notes: "",
    assignedToId: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (!formData.name.trim()) {
      setError("Jméno je povinné");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone || null,
          source: formData.source,
          status: formData.status,
          budget: formData.budget ? parseInt(formData.budget) : null,
          notes: formData.notes || null,
          assignedToId: formData.assignedToId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Nepodařilo se vytvořit lead");
      }

      // Redirect to lead detail or CRM list
      if (data.data?.id) {
        router.push(`/crm/${data.data.id}`);
      } else {
        router.push("/crm");
      }
      
      router.refresh(); // Refresh server components
    } catch (err: any) {
      console.error("Chyba při vytváření leadu:", err);
      setError(err.message || "Došlo k chybě při vytváření leadu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" asChild>
          <Link href="/crm">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nový Lead</h1>
          <p className="text-muted-foreground mt-2">
            Vytvořte nový lead a začněte s ním pracovat
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informace o leadu</CardTitle>
              <CardDescription>
                Vyplňte základní informace o novém leadu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Jméno *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Jan Novák"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="jan@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="+420 123 456 789"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>

                  {/* Budget */}
                  <div className="space-y-2">
                    <Label htmlFor="budget">Rozpočet (Kč)</Label>
                    <Input
                      id="budget"
                      name="budget"
                      type="number"
                      placeholder="5000000"
                      value={formData.budget}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>

                  {/* Source */}
                  <div className="space-y-2">
                    <Label htmlFor="source">Zdroj</Label>
                    <select
                      id="source"
                      name="source"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.source}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      {SOURCE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      name="status"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.status}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      {STATUS_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Assigned To ID */}
                <div className="space-y-2">
                  <Label htmlFor="assignedToId">ID přiřazeného uživatele (volitelné)</Label>
                  <Input
                    id="assignedToId"
                    name="assignedToId"
                    placeholder="user_123"
                    value={formData.assignedToId}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Zadejte ID uživatele z databáze. Pokud necháte prázdné, lead nebude přiřazen.
                  </p>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Poznámky</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Další informace o leadu, preferencích, atd."
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    disabled={loading}
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/crm")}
                    disabled={loading}
                  >
                    Zrušit
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? "Vytváření..." : "Vytvořit Lead"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Tipy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Povinná pole</h3>
                <p className="text-sm text-muted-foreground">
                  Jediné povinné pole je <strong>Jméno</strong>. Ostatní pole můžete vyplnit později.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Status leadu</h3>
                <p className="text-sm text-muted-foreground">
                  Začněte s <strong>Nový</strong> a postupně měňte status podle fáze jednání.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Rozpočet</h3>
                <p className="text-sm text-muted-foreground">
                  Zadejte částku v korunách bez mezer a formátování (např. 5000000 pro 5 milionů).
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}