"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  Target, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  AlertCircle,
  DollarSign,
  MessageSquare,
  BarChart,
  Zap,
  ArrowRight,
  Shield
} from "lucide-react";

interface AIResults {
  headline: string;
  shortDesc: string;
  longDesc: string;
  bulletPoints: any;
  seoTitle: string;
  seoDescription: string;
  priceSuggestion: number;
  targetAudience: string;
}

interface AISummaryCardProps {
  aiResults: AIResults | null;
  confidenceScore?: number;
  className?: string;
  compact?: boolean;
}

export default function AISummaryCard({ aiResults, confidenceScore = 85, className, compact = false }: AISummaryCardProps) {
  const hasAIResults = !!aiResults;
  const isPlaceholder = hasAIResults && aiResults.headline === "Generating...";

  if (compact) {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Compact header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-sans tracking-tight">AI Generated Content</h3>
              <p className="text-sm text-muted-foreground font-sans tracking-tight">Automatically generated</p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-primary to-primary/80 text-white border-0 px-3 py-1 font-sans tracking-tight">
            {confidenceScore}% confidence
          </Badge>
        </div>

        {/* Compact content */}
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-primary mb-1 font-sans tracking-tight">Headline</h4>
            <p className="text-base font-medium font-sans tracking-tight">
              {hasAIResults && !isPlaceholder ? aiResults.headline : "AI is generating headline..."}
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-primary mb-1 font-sans tracking-tight">Description</h4>
            <p className="text-sm text-muted-foreground font-sans tracking-tight">
              {hasAIResults && !isPlaceholder ? aiResults.shortDesc : "AI is analyzing photos..."}
            </p>
          </div>

          {hasAIResults && !isPlaceholder && aiResults.priceSuggestion && (
            <div className="pt-3 border-t border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-primary mb-1 font-sans tracking-tight">AI Suggested Price</h4>
                  <p className="text-lg font-bold text-green-600 font-sans tracking-tight">
                    {new Intl.NumberFormat("cs-CZ", {
                      style: "currency",
                      currency: "CZK",
                      maximumFractionDigits: 0,
                    }).format(aiResults.priceSuggestion)}
                  </p>
                </div>
                <div className="text-right">
                  <h4 className="text-sm font-semibold text-primary mb-1 font-sans tracking-tight">Target Audience</h4>
                  <p className="text-sm font-sans tracking-tight">{aiResults.targetAudience}</p>
                </div>
              </div>
            </div>
          )}

          {isPlaceholder && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="animate-spin">
                <Sparkles className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-700 font-sans tracking-tight">AI is working</p>
                <p className="text-xs text-amber-600 font-sans tracking-tight">Generating content based on your photos...</p>
              </div>
            </div>
          )}

          {!hasAIResults && (
            <div className="p-3 rounded-lg bg-muted/50 border border-dashed">
              <p className="text-sm text-muted-foreground font-sans tracking-tight text-center">
                AI content not available yet
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-8", className)}>
      {/* Hlavní AI obsah s confidence score - PREMIUM */}
      <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full -translate-y-24 translate-x-24 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full translate-y-16 -translate-x-16"></div>
        
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold font-sans tracking-tight flex items-center gap-3">
                  AI Generovaný obsah
                  <Badge className="ml-2 bg-gradient-to-r from-primary to-primary/80 text-white border-0 px-4 py-1.5 font-sans tracking-tight">
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    AI-Powered
                  </Badge>
                </CardTitle>
                <CardDescription className="text-base font-sans tracking-tight">
                  Automaticky vygenerováno na základě nahraných fotografií s vysokou přesností
                </CardDescription>
              </div>
            </div>
            
            {/* Confidence Score - PREMIUM */}
            <div className="text-right bg-white/50 dark:bg-black/30 backdrop-blur-sm p-4 rounded-xl border border-primary/20">
              <div className="flex items-center justify-end gap-3 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <div className="text-sm font-medium text-muted-foreground font-sans tracking-tight">AI Confidence</div>
                <Badge variant="outline" className="font-bold text-xl px-4 py-1.5 font-sans tracking-tight border-primary/30">
                  {confidenceScore}%
                </Badge>
              </div>
              <Progress value={confidenceScore} className="h-3 w-48 bg-primary/10" />
              <p className="text-xs text-muted-foreground mt-2 font-sans tracking-tight">
                Vysoká důvěryhodnost odhadů
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Headline s podtržením - PREMIUM */}
          <div className="relative bg-gradient-to-r from-primary/5 to-transparent p-6 rounded-2xl border-l-4 border-primary">
            <div className="absolute -left-2 top-1/2 -translate-y-1/2">
              <div className="w-1 h-16 bg-gradient-to-b from-primary to-primary/60 rounded-full"></div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold uppercase tracking-wider text-primary font-sans tracking-tight">
                  Titulek
                </h3>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent font-sans tracking-tight">
                {hasAIResults && !isPlaceholder ? aiResults.headline : "AI generuje titulek..."}
              </p>
              <div className="h-1.5 w-32 bg-gradient-to-r from-primary to-primary/50 rounded-full mt-4"></div>
            </div>
          </div>

          {/* Short Description - PREMIUM */}
          <div className="bg-gradient-to-br from-muted/40 to-muted/20 p-6 rounded-2xl border border-primary/20">
            <div className="flex items-center gap-3 mb-5">
              <BarChart className="h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold uppercase tracking-wider text-primary font-sans tracking-tight">
                Krátký popis
              </h3>
            </div>
            <p className="text-xl leading-relaxed font-sans tracking-tight">
              {hasAIResults && !isPlaceholder ? aiResults.shortDesc : "AI analyzuje fotografie a vytváří popis..."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Samostatné karty: Cílová skupina, Cena, Další kroky */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 🎯 Cílová skupina */}
        <Card className="bg-gradient-to-br from-rose-500/15 to-rose-500/5 border-rose-500/30 hover:border-rose-500/50 transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-rose-500/20">
                <div className="text-2xl">🎯</div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold font-sans tracking-tight">Cílová skupina</CardTitle>
                <CardDescription className="font-sans tracking-tight">Optimalizováno pro</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-rose-600" />
                <p className="text-lg font-medium font-sans tracking-tight">
                  {hasAIResults && !isPlaceholder ? aiResults.targetAudience : "Mladé páry, rodiny s dětmi"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-rose-500/15 text-rose-700 border-rose-500/40 font-sans tracking-tight">
                  Investoři
                </Badge>
                <Badge variant="outline" className="bg-rose-500/15 text-rose-700 border-rose-500/40 font-sans tracking-tight">
                  První bydlení
                </Badge>
                <Badge variant="outline" className="bg-rose-500/15 text-rose-700 border-rose-500/40 font-sans tracking-tight">
                  Rodiny
                </Badge>
              </div>
              <div className="pt-3 border-t border-rose-500/20">
                <div className="flex items-center gap-2 text-sm text-rose-600 font-sans tracking-tight">
                  <Target className="h-4 w-4" />
                  <span>Přesně cílená marketingová strategie</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 💰 Odhadovaná cena */}
        <Card className="bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50 transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/20">
                <div className="text-2xl">💰</div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold font-sans tracking-tight">Odhadovaná cena</CardTitle>
                <CardDescription className="font-sans tracking-tight">Optimalizovaná cena</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-emerald-700 font-sans tracking-tight">
                  {hasAIResults && aiResults.priceSuggestion 
                    ? new Intl.NumberFormat("cs-CZ", {
                        style: "currency",
                        currency: "CZK",
                        maximumFractionDigits: 0,
                      }).format(aiResults.priceSuggestion)
                    : "8 500 000 Kč"}
                </span>
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-sans tracking-tight">Tržní průměr</span>
                  <span className="font-medium font-sans tracking-tight">7 200 000 Kč</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-sans tracking-tight">AI Premium</span>
                  <Badge className="bg-emerald-500/20 text-emerald-700 border-0 font-sans tracking-tight">
                    +18%
                  </Badge>
                </div>
              </div>

              <div className="pt-3 border-t border-emerald-500/20">
                <div className="flex items-center gap-2 text-sm text-emerald-600 font-sans tracking-tight">
                  <CheckCircle className="h-4 w-4" />
                  <span>Optimalizovaná pro rychlý prodej</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 🚀 Další kroky */}
        <Card className="bg-gradient-to-br from-blue-500/15 to-blue-500/5 border-blue-500/30 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/20">
                <div className="text-2xl">🚀</div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold font-sans tracking-tight">Další kroky</CardTitle>
                <CardDescription className="font-sans tracking-tight">Doporučené akce</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-blue-600" />
                <p className="text-lg font-medium font-sans tracking-tight">
                  Export na realitní portály
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-blue-500/15 text-blue-700 border-blue-500/40 font-sans tracking-tight">
                  Sreality.cz
                </Badge>
                <Badge variant="outline" className="bg-blue-500/15 text-blue-700 border-blue-500/40 font-sans tracking-tight">
                  Bezrealitky
                </Badge>
                <Badge variant="outline" className="bg-blue-500/15 text-blue-700 border-blue-500/40 font-sans tracking-tight">
                  Facebook
                </Badge>
              </div>
              <div className="pt-3 border-t border-blue-500/20">
                <div className="flex items-center gap-2 text-sm text-blue-600 font-sans tracking-tight">
                  <ArrowRight className="h-4 w-4" />
                  <span>Automatické sdílení na sociální sítě</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEO Metadata - PREMIUM */}
      {hasAIResults && !isPlaceholder && (
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/30">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/20">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold font-sans tracking-tight">SEO Optimalizace</CardTitle>
                <CardDescription className="font-sans tracking-tight">Pro lepší viditelnost ve vyhledávačích</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-base font-semibold text-blue-600 mb-3 font-sans tracking-tight">SEO Titulek</h4>
              <p className="text-base bg-blue-50 dark:bg-blue-950/40 p-4 rounded-xl border border-blue-500/20 font-sans tracking-tight">
                {aiResults.seoTitle}
              </p>
            </div>
            <div>
              <h4 className="text-base font-semibold text-blue-600 mb-3 font-sans tracking-tight">SEO Popis</h4>
              <p className="text-base bg-blue-50 dark:bg-blue-950/40 p-4 rounded-xl border border-blue-500/20 font-sans tracking-tight">
                {aiResults.seoDescription}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Placeholder stav */}
      {isPlaceholder && (
        <Card className="border-amber-500/30 bg-amber-500/10">
          <CardContent className="py-8">
            <div className="flex items-center justify-center gap-6">
              <div className="animate-spin">
                <Sparkles className="h-10 w-10 text-amber-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-amber-700 font-sans tracking-tight">AI právě pracuje</h3>
                <p className="text-base text-amber-600 font-sans tracking-tight">
                  Generujeme obsah na základě vašich fotografií...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No AI results */}
      {!hasAIResults && (
        <Card className="border-dashed border-2">
          <CardContent className="py-10 text-center">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-3 font-sans tracking-tight">AI obsah zatím není k dispozici</h3>
            <p className="text-base text-muted-foreground font-sans tracking-tight">
              Počkejte na dokončení zpracování fotografií nebo spusťte AI generování.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}