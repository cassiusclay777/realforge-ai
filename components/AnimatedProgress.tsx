"use client";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, Image as ImageIcon, Sparkles, Zap, Trophy } from "lucide-react";

interface ProgressItem {
  label: string;
  value: number;
  icon: React.ReactNode;
  status: "completed" | "processing" | "pending";
}

interface AnimatedProgressProps {
  progress: {
    images: {
      total: number;
      processed: number;
      percentage: number;
      status: string;
    };
    ai: {
      generated: boolean;
      complete: boolean;
      status: string;
      hasPlaceholder: boolean;
    };
    overall: {
      status: string;
      percentage: number;
      estimatedCompletion: string;
    };
  };
  className?: string;
}

export default function AnimatedProgress({ progress, className }: AnimatedProgressProps) {
  const progressItems: ProgressItem[] = [
    {
      label: `Obrázky (${progress.images.processed}/${progress.images.total})`,
      value: progress.images.percentage,
      icon: <ImageIcon className="h-5 w-5" />,
      status: progress.images.status === "completed" ? "completed" : 
              progress.images.status === "processing" ? "processing" : "pending",
    },
    {
      label: "AI generování",
      value: progress.ai.complete ? 100 : progress.ai.generated ? 50 : 0,
      icon: <Sparkles className="h-5 w-5" />,
      status: progress.ai.complete ? "completed" : 
              progress.ai.generated ? "processing" : "pending",
    },
  ];

  const overallStatus = progress.overall.status;
  const isCompleted = overallStatus === "completed";
  const isProcessing = overallStatus === "processing";

  return (
    <div className={cn("space-y-8", className)}>
      {/* Celkový progress s animací - PREMIUM */}
      <div className="relative bg-gradient-to-br from-primary/5 to-transparent p-6 rounded-2xl border-2 border-primary/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-xl relative",
              isCompleted 
                ? "bg-gradient-to-br from-green-500 to-green-600 text-white animate-bounce" 
                : isProcessing
                ? "bg-gradient-to-br from-primary to-primary/80 text-white animate-pulse"
                : "bg-gradient-to-br from-muted to-muted/80 text-muted-foreground"
            )}>
              {isCompleted ? (
                <Trophy className="h-8 w-8" />
              ) : isProcessing ? (
                <Zap className="h-8 w-8 animate-spin" />
              ) : (
                <Clock className="h-8 w-8" />
              )}
              {/* Pulse effect for processing */}
              {isProcessing && (
                <div className="absolute inset-0 rounded-xl bg-primary/30 animate-ping"></div>
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold font-sans tracking-tight">Stav zpracování</h3>
              <p className="text-base text-muted-foreground font-sans tracking-tight">
                {isCompleted 
                  ? "Zpracování úspěšně dokončeno! 🎉" 
                  : isProcessing
                  ? "AI zpracovává váš obsah s vysokou přesností..."
                  : "Čeká na zahájení zpracování"}
              </p>
            </div>
          </div>
          
          {/* Celkové procento s animací - PREMIUM */}
          <div className="text-right bg-white/50 dark:bg-black/30 backdrop-blur-sm p-4 rounded-xl border border-primary/20">
            <div className={cn(
              "text-5xl font-bold mb-2 font-sans tracking-tight",
              isCompleted 
                ? "text-green-600 animate-bounce" 
                : isProcessing
                ? "text-primary animate-pulse"
                : "text-muted-foreground"
            )}>
              {progress.overall.percentage}%
            </div>
            <p className={cn(
              "text-sm font-medium font-sans tracking-tight",
              isCompleted ? "text-green-600" : "text-muted-foreground"
            )}>
              {isCompleted ? "✅ Dokončeno" : "⟳ Probíhá"}
            </p>
          </div>
        </div>

        {/* Hlavní progress bar s animací - PREMIUM */}
        <div className="relative">
          <Progress 
            value={progress.overall.percentage} 
            className={cn(
              "h-4 rounded-full bg-primary/10",
              isCompleted && "animate-pulse",
              isProcessing && "animate-pulse"
            )}
          />
          
          {/* Animované tečky při zpracování */}
          {isProcessing && (
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between px-3">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-primary/60 animate-pulse shadow-lg"
                  style={{
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: "1.2s",
                  }}
                />
              ))}
            </div>
          )}

          {/* Completion celebration effect */}
          {isCompleted && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/10 to-transparent animate-pulse rounded-full"></div>
          )}
        </div>

        {/* Odhadovaný čas */}
        <p className={cn(
          "text-base mt-4 flex items-center gap-3 font-sans tracking-tight",
          isCompleted 
            ? "text-green-600 font-bold" 
            : "text-muted-foreground"
        )}>
          {isCompleted ? (
            <>
              <CheckCircle className="h-5 w-5 animate-bounce" />
              <span className="animate-pulse">✅ Všechny úkoly úspěšně dokončeny!</span>
            </>
          ) : (
            <>
              <Clock className="h-5 w-5 animate-pulse" />
              <span>⏳ Odhadovaný čas dokončení: <strong>{progress.overall.estimatedCompletion}</strong></span>
            </>
          )}
        </p>
      </div>

      {/* Detailní progress jednotlivých částí - PREMIUM */}
      <div className="space-y-6">
        <h4 className="text-xl font-bold font-sans tracking-tight">Detailní průběh</h4>
        {progressItems.map((item, index) => (
          <div key={index} className="space-y-3 bg-gradient-to-r from-muted/20 to-transparent p-4 rounded-xl border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg relative",
                  item.status === "completed" 
                    ? "bg-gradient-to-br from-green-500/20 to-green-600/10 text-green-600" 
                    : item.status === "processing"
                    ? "bg-gradient-to-br from-primary/20 to-primary/10 text-primary animate-pulse"
                    : "bg-gradient-to-br from-muted to-muted/10 text-muted-foreground"
                )}>
                  {item.icon}
                  {/* Processing spin animation */}
                  {item.status === "processing" && (
                    <div className="absolute inset-0 rounded-lg bg-primary/10 animate-ping"></div>
                  )}
                </div>
                <span className="text-base font-medium font-sans tracking-tight">{item.label}</span>
              </div>
              <span className={cn(
                "text-lg font-bold font-sans tracking-tight",
                item.status === "completed" 
                  ? "text-green-600 animate-bounce" 
                  : item.status === "processing"
                  ? "text-primary animate-pulse"
                  : "text-muted-foreground"
              )}>
                {item.value}%
              </span>
            </div>
            
            <div className="relative">
              <Progress 
                value={item.value} 
                className={cn(
                  "h-3 rounded-full",
                  item.status === "processing" && "animate-pulse",
                  item.status === "completed" && "bg-green-500/20"
                )}
              />
              
              {/* Animace dokončení */}
              {item.status === "completed" && (
                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-75"></div>
              )}

              {/* Processing dots animation */}
              {item.status === "processing" && item.value > 0 && (
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/30 to-transparent rounded-full transition-all duration-1000"
                  style={{ width: `${item.value}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-lg"></div>
                </div>
              )}
            </div>
            
            {/* Status text */}
            <p className={cn(
              "text-sm font-medium font-sans tracking-tight",
              item.status === "completed" 
                ? "text-green-600" 
                : item.status === "processing"
                ? "text-primary animate-pulse"
                : "text-muted-foreground"
            )}>
              {item.status === "completed" 
                ? "✅ Dokončeno" 
                : item.status === "processing"
                ? "⟳ Zpracovává se..."
                : "⏳ Čeká na zahájení"}
            </p>
          </div>
        ))}
      </div>

      {/* Completion celebration - PREMIUM */}
      {isCompleted && (
        <div className="mt-8 p-6 bg-gradient-to-r from-green-500/15 via-emerald-500/10 to-green-500/15 rounded-2xl border-2 border-green-500/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="animate-bounce">
                <Trophy className="h-12 w-12 text-green-600" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-green-700 font-sans tracking-tight">Hotovo! 🎉</h4>
                <p className="text-base text-green-600 font-sans tracking-tight">
                  Váš obsah je připraven k exportu a sdílení. AI generování proběhlo úspěšně!
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-ping"></div>
              <div className="w-3 h-3 rounded-full bg-green-500 animate-ping" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-3 h-3 rounded-full bg-green-500 animate-ping" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Processing celebration */}
      {isProcessing && (
        <div className="mt-8 p-6 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/15 rounded-2xl border-2 border-primary/30">
          <div className="flex items-center gap-4">
            <div className="animate-spin">
              <Zap className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-primary font-sans tracking-tight">AI pracuje na plný výkon ⚡</h4>
              <p className="text-base text-primary/80 font-sans tracking-tight">
                Analyzujeme fotografie a generujeme optimalizovaný obsah pro maximální konverzi.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}