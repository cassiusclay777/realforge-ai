"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = { integrationId: string; name: string };

export function IntegrationTestButton({ integrationId, name }: Props) {
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    if (name !== "DeepSeek AI") {
      alert("Test pro tuto integraci zatím není k dispozici.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/test", { method: "POST", credentials: "same-origin" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        alert("Test proběhl úspěšně.");
      } else {
        alert(data.message || data.error || "Test selhal.");
      }
    } catch {
      alert("Chyba při volání API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleTest} disabled={loading}>
      {loading ? "Testuji…" : "Testovat"}
    </Button>
  );
}
