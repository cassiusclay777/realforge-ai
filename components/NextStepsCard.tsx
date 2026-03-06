"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  CheckCircle, 
  TrendingUp, 
  Users, 
  Target, 
  Zap, 
  Star,
  ArrowRight,
  Calendar,
  BarChart
} from "lucide-react";

interface NextStepsCardProps {
  nextSteps: string[];
  status: "completed" | "processing" | "pending";
  className?: string;
}

const STEP_ICONS = [
  <CheckCircle key="check" className="h-5 w-5" />,
  <TrendingUp key="trend" className="h-5 w-5" />,
  <Users key="users" className="h-5 w-5" />,
  <Target key="target" className="h-5 w-5" />,
  <Zap key="zap" className="h-5 w-5" />,
  <Star key="star" className="h-5 w-5" />,
];

const STEP_COLORS = [
  "from-blue-500/20 to-blue-600/10 text-blue-700 border-blue-500/20",
  "from-emerald-500/20 to-emerald-600/10 text-emerald-700 border-emerald-500/20",
  "from-amber-500/20 to-amber-600/10 text-amber-700 border-amber-500/20",
  "from-rose-500/20 to-rose-600/10 text-rose-700 border-rose-500/20",
  "from-purple-500/20 to-purple-600/10 text-purple-700 border-purple-500/20",
  "from-cyan-500/20 to-cyan-600/10 text-cyan-700 border-cyan-500/20",
];

export default function NextStepsCard({ nextSteps, status, className }: NextStepsCardProps) {
  const isCompleted = status === "completed";
  const isProcessing = status === "processing";

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {/* Background gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
      
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              isCompleted 
                ? "bg-green-500/20 text-green-600" 
                : isProcessing
                ? "bg-primary/20 text-primary animate-pulse"
                : "bg-muted text-muted-foreground"
            )}>
              {isCompleted ? (
                <CheckCircle className="h-6 w-6" />
              ) : (
                <ArrowRight className="h-6 w-6" />
              )}
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Další kroky</CardTitle>
              <CardDescription>
                {isCompleted 
                  ? "Všechny úkoly dokončeny" 
                  : isProcessing
                  ? "Průvodce dalšími kroky"
                  : "Plánované akce"}
              </CardDescription>
            </div>
          </div>
          
          <Badge variant={isCompleted ? "default" : "outline"} className={cn(
            isCompleted && "bg-green-500 hover:bg-green-600",
            isProcessing && "animate-pulse"
          )}>
            {isCompleted ? "Hotovo" : isProcessing ? "Probíhá" : "Plánováno"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {nextSteps.map((step, index) => {
            const colorClass = STEP_COLORS[index % STEP_COLORS.length];
            const Icon = STEP_ICONS[index % STEP_ICONS.length];
            
            return (
              <div
                key={index}
                className={cn(
                  "group relative p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-pointer",
                  colorClass,
                  isCompleted && "opacity-90"
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Icon circle */}
                  <div className={cn(
                    "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
                    colorClass.split(' ')[0].replace('from-', 'bg-').replace('/20', '/30')
                  )}>
                    <div className={cn(
                      "p-2 rounded-full",
                      colorClass.split(' ')[2].replace('text-', 'bg-').replace('/20', '/20')
                    )}>
                      {Icon}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-lg">{step}</h4>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          isCompleted && "bg-green-500/10 text-green-700 border-green-500/30"
                        )}
                      >
                        {isCompleted ? "✓ Hotovo" : `Krok ${index + 1}`}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-2">
                      {getStepDescription(step, index, status)}
                    </p>

                    {/* Progress indicator */}
                    {!isCompleted && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Pokrok</span>
                          <span className="font-medium">
                            {isProcessing ? `${Math.min(100, (index + 1) * 25)}%` : "0%"}
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              colorClass.split(' ')[0].replace('from-', 'bg-').replace('/20', '')
                            )}
                            style={{
                              width: isProcessing ? `${Math.min(100, (index + 1) * 25)}%` : "0%"
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Arrow indicator */}
                  <div className={cn(
                    "flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    "text-muted-foreground group-hover:text-primary"
                  )}>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
            );
          })}
        </div>

        {/* Status summary */}
        <div className={cn(
          "mt-6 p-4 rounded-xl border",
          isCompleted 
            ? "bg-green-500/10 border-green-500/20" 
            : isProcessing
            ? "bg-primary/10 border-primary/20"
            : "bg-muted/50 border-muted"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              isCompleted 
                ? "bg-green-500/20 text-green-600" 
                : isProcessing
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            )}>
              {isCompleted ? (
                <CheckCircle className="h-5 w-5" />
              ) : isProcessing ? (
                <BarChart className="h-5 w-5" />
              ) : (
                <Calendar className="h-5 w-5" />
              )}
            </div>
            <div>
              <h4 className="font-bold">
                {isCompleted 
                  ? "Všechny kroky dokončeny" 
                  : isProcessing
                  ? "Průběžný stav"
                  : "Čeká na zahájení"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {isCompleted 
                  ? "Můžete pokračovat exportem nebo sdílením."
                  : isProcessing
                  ? "AI zpracovává obsah, další kroky budou automaticky naplánovány."
                  : "Začněte zpracováním pro automatické naplánování kroků."}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getStepDescription(step: string, index: number, status: string): string {
  const stepLower = step.toLowerCase();
  
  if (stepLower.includes("review") || stepLower.includes("zkontrolujte")) {
    return "Projděte AI generovaný obsah a proveďte případné úpravy.";
  }
  
  if (stepLower.includes("export") || stepLower.includes("sreality")) {
    return "Automatický export na realitní portály s optimalizovaným obsahem.";
  }
  
  if (stepLower.includes("share") || stepLower.includes("sociální")) {
    return "Sdílejte na sociálních sítích s předpřipravenými příspěvky.";
  }
  
  if (stepLower.includes("ai") || stepLower.includes("generování")) {
    return "AI analyzuje fotografie a vytváří marketingový obsah.";
  }
  
  if (stepLower.includes("waiting") || stepLower.includes("čeká")) {
    return "Čekáme na zahájení zpracování nahraných souborů.";
  }
  
  if (stepLower.includes("upload") || stepLower.includes("nahrajte")) {
    return "Přidejte více fotografií pro lepší výsledky AI analýzy.";
  }
  
  return "Automatizovaný krok pro optimalizaci vašeho realitního inzerátu.";
}