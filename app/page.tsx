import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Gradient orbs – design tokeny */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 backdrop-blur px-4 py-2 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span>Realitní platforma s AI</span>
          </div>

          <h1 className="page-title text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
            Jeden listing.
            <br />
            <span className="text-primary">Všechny portály.</span>
            <br />
            Za 30 vteřin.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Nahrajte fotky, AI vytvoří popisy a roztřídí místnosti. Export na Sreality, Bezrealitky a další.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="gap-2 shadow-lg shadow-primary/20" asChild>
              <Link href="/login">Přihlásit se</Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2" asChild>
              <Link href="/register">Vytvořit účet</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
