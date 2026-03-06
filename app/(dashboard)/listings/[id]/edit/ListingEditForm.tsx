"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TYPES = ["APARTMENT", "HOUSE", "LAND", "COMMERCIAL", "OTHER"];
const STATUSES = ["NEW", "PROCESSING", "PROCESSED", "ACTIVE", "REZERVACE", "PRODANO"];

type Listing = {
  id: string;
  title: string;
  address: string;
  type: string;
  price: number;
  area: number | null;
  rooms: number | null;
  status: string;
  description: string | null;
};

export function ListingEditForm({ listing }: { listing: Listing }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: listing.title,
    address: listing.address,
    type: listing.type,
    price: String(listing.price),
    area: listing.area != null ? String(listing.area) : "",
    rooms: listing.rooms != null ? String(listing.rooms) : "",
    status: listing.status,
    description: listing.description ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          address: form.address,
          type: form.type,
          price: form.price ? parseInt(form.price, 10) : undefined,
          area: form.area ? parseInt(form.area, 10) : null,
          rooms: form.rooms ? parseInt(form.rooms, 10) : null,
          status: form.status,
          description: form.description || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Uložení selhalo");
        return;
      }
      router.push(`/listings/${listing.id}`);
      router.refresh();
    } catch {
      setError("Chyba při ukládání");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="title">Název</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Adresa</Label>
        <Input
          id="address"
          value={form.address}
          onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Typ</Label>
          <Select
            value={form.type}
            onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}
          >
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={form.status}
            onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Cena (Kč)</Label>
          <Input
            id="price"
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="area">Plocha (m²)</Label>
          <Input
            id="area"
            type="number"
            min={0}
            value={form.area}
            onChange={(e) => setForm((p) => ({ ...p, area: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rooms">Pokojů</Label>
          <Input
            id="rooms"
            type="number"
            min={0}
            value={form.rooms}
            onChange={(e) => setForm((p) => ({ ...p, rooms: e.target.value }))}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Popis</Label>
        <Textarea
          id="description"
          rows={4}
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Ukládám…" : "Uložit"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/listings/${listing.id}`)}
        >
          Zrušit
        </Button>
      </div>
    </form>
  );
}
