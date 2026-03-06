"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ImageIcon, Star } from "lucide-react";
import CategoryIcon from "./CategoryIcons";

interface MediaItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  category: string;
  aiTags: string[];
  aiSaliencyScore?: number;
  isFeatured: boolean;
  processingStatus: string;
}

interface GalleryGridProps {
  media: MediaItem[];
  className?: string;
  compact?: boolean;
}

const CATEGORY_CONFIG = {
  KITCHEN: {
    bgColor: "bg-amber-500",
    label: "Kuchyň",
    borderColor: "border-amber-500/30",
    textColor: "text-amber-700",
  },
  BEDROOM: {
    bgColor: "bg-rose-500",
    label: "Ložnice",
    borderColor: "border-rose-500/30",
    textColor: "text-rose-700",
  },
  BATHROOM: {
    bgColor: "bg-sky-500",
    label: "Koupelna",
    borderColor: "border-sky-500/30",
    textColor: "text-sky-700",
  },
  FACADE: {
    bgColor: "bg-slate-700",
    label: "Fasáda",
    borderColor: "border-slate-700/30",
    textColor: "text-slate-700",
  },
  LIVING_ROOM: {
    bgColor: "bg-emerald-600",
    label: "Obývák",
    borderColor: "border-emerald-600/30",
    textColor: "text-emerald-700",
  },
  ADVERTISEMENT: {
    bgColor: "bg-blue-600",
    label: "Reklama",
    borderColor: "border-blue-600/30",
    textColor: "text-blue-700",
  },
  HIDDEN: {
    bgColor: "bg-gray-800",
    label: "Skryté",
    borderColor: "border-gray-800/30",
    textColor: "text-gray-700",
  },
  HALLWAY: {
    bgColor: "bg-purple-500",
    label: "Chodba",
    borderColor: "border-purple-500/30",
    textColor: "text-purple-700",
  },
} as const;

export default function GalleryGrid({ media, className }: GalleryGridProps) {
  const getCategoryConfig = (category: string) => {
    const key = category as keyof typeof CATEGORY_CONFIG;
    return CATEGORY_CONFIG[key] || {
      bgColor: "bg-gray-500",
      label: category.toLowerCase().replace("_", " "),
      borderColor: "border-gray-500/30",
      textColor: "text-gray-700",
    };
  };

  // Najdi hlavní fotku (isFeatured) nebo první fotku
  const featuredMedia = media.find((item) => item.isFeatured) || media[0];
  const otherMedia = media.filter((item) => item.id !== featuredMedia?.id);

  return (
    <div className={cn("space-y-8", className)}>
      {/* Hlavní fotka s FEATURED badge - PREMIUM STYL */}
      {featuredMedia && (
        <div className="relative group">
          <div className="relative overflow-hidden rounded-2xl border-4 border-amber-500 shadow-2xl shadow-amber-500/30 transform -skew-x-1 transition-all duration-500 hover:skew-x-0 hover:scale-[1.02] hover:shadow-amber-500/50">
            <div className="skew-x-1">
              <div className="aspect-video relative">
                {featuredMedia.url ? (
                  <>
                    <img 
                      src={featuredMedia.url.startsWith('/') ? featuredMedia.url : `/uploads/${featuredMedia.url}`}
                      alt="Hlavní fotka"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        // Fallback to placeholder
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const placeholder = document.createElement('div');
                          placeholder.className = "w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center";
                          placeholder.innerHTML = `
                            <div class="text-center p-8">
                              <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/20 mb-4 animate-pulse">
                                <svg class="h-10 w-10 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2L2 7v13h20V7L12 2zm0 2.8L18 7v11H6V7l6-4.2z"/>
                                </svg>
                              </div>
                              <p class="text-gray-300 text-lg font-sans tracking-tight">Hlavní fotka</p>
                              <p class="text-sm text-gray-400 mt-2">${featuredMedia.category.toLowerCase().replace("_", " ")}</p>
                            </div>
                          `;
                          parent.appendChild(placeholder);
                        }
                      }}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    
                    {/* Content overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-8">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-amber-500/20 mb-6 animate-pulse">
                          <Star className="h-12 w-12 text-amber-300" />
                        </div>
                        <p className="text-white text-2xl font-bold font-sans tracking-tight mb-2">Hlavní fotka</p>
                        <p className="text-amber-200 text-base font-sans tracking-tight">
                          {featuredMedia.category.toLowerCase().replace("_", " ")}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-amber-500/20 mb-6 animate-pulse">
                        <Star className="h-12 w-12 text-amber-300" />
                      </div>
                      <p className="text-white text-2xl font-bold font-sans tracking-tight mb-2">Hlavní fotka</p>
                      <p className="text-amber-200 text-base font-sans tracking-tight">
                        {featuredMedia.category.toLowerCase().replace("_", " ")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* FEATURED badge - PREMIUM */}
            <div className="absolute top-6 right-6 z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500 rounded-xl blur-md animate-pulse"></div>
                <Badge className="relative bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 px-5 py-2.5 text-sm font-bold shadow-xl font-sans tracking-tight">
                  <Star className="h-4 w-4 mr-2" />
                  FEATURED
                </Badge>
              </div>
            </div>

            {/* AI Score badge */}
            <div className="absolute bottom-6 left-6 z-10">
              <Badge className="bg-black/80 backdrop-blur-md text-white border-0 px-4 py-2 font-sans tracking-tight">
                AI Confidence: {featuredMedia.aiSaliencyScore ? Math.round(featuredMedia.aiSaliencyScore * 100) : 85}%
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Mřížka ostatních fotek */}
      {otherMedia.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-bold font-sans tracking-tight">Všechny fotografie ({media.length})</h3>
            <div className="text-base text-muted-foreground font-sans tracking-tight">
              {otherMedia.length} dalších
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {otherMedia.map((item) => {
              const config = getCategoryConfig(item.category);
              
              return (
                <Card 
                  key={item.id} 
                  className={cn(
                    "group relative overflow-hidden border-2 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer",
                    config.borderColor,
                    "hover:shadow-" + config.bgColor.replace("bg-", "") + "/20"
                  )}
                >
                  <CardContent className="p-0">
                    <div className="aspect-square relative">
                      {/* Kategorie badge */}
                      <div className="absolute top-3 left-3 z-10">
                        <Badge className={cn(
                          "backdrop-blur-md border-0 font-semibold font-sans tracking-tight px-3 py-1.5",
                          config.bgColor,
                          "text-white"
                        )}>
                          <CategoryIcon category={item.category} className="h-4 w-4 mr-1.5" />
                          {config.label}
                        </Badge>
                      </div>

                      {/* AI Tags badge */}
                      {item.aiTags.length > 0 && (
                        <div className="absolute top-3 right-3 z-10">
                          <Badge variant="outline" className="bg-black/60 backdrop-blur-md text-white border-white/30 text-xs font-sans tracking-tight">
                            {item.aiTags.length} AI tagů
                          </Badge>
                        </div>
                      )}

                      {/* Actual image or placeholder */}
                      <div className="w-full h-full relative">
                        {item.url ? (
                          <>
                            {/* Image with gradient overlay */}
                            <img 
                              src={item.url.startsWith('/') ? item.url : `/uploads/${item.url}`}
                              alt={config.label}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              onError={(e) => {
                                // Fallback to placeholder if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  const placeholder = document.createElement('div');
                                  placeholder.className = cn(
                                    "w-full h-full flex flex-col items-center justify-center p-6",
                                    config.bgColor,
                                    "bg-gradient-to-br from-white/10 to-transparent"
                                  );
                                  placeholder.innerHTML = `
                                    <div class="mb-4">
                                      <div class="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center animate-pulse">
                                        <div class="text-white text-2xl">🏠</div>
                                      </div>
                                    </div>
                                    <p class="text-white font-bold text-center text-base font-sans tracking-tight">${config.label}</p>
                                    <p class="text-white/80 text-sm mt-2 text-center font-sans tracking-tight">${item.aiTags.slice(0, 2).join(", ")}</p>
                                  `;
                                  parent.appendChild(placeholder);
                                }
                              }}
                            />
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-300"></div>
                            
                            {/* Category icon overlay */}
                            <div className="absolute bottom-4 right-4">
                              <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/20">
                                <CategoryIcon category={item.category} className="h-6 w-6 text-white" />
                              </div>
                            </div>
                          </>
                        ) : (
                          /* Placeholder when no image URL */
                          <div className={cn(
                            "w-full h-full flex flex-col items-center justify-center p-6",
                            config.bgColor,
                            "bg-gradient-to-br from-white/10 to-transparent"
                          )}>
                            <div className="mb-4">
                              <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center animate-pulse">
                                <CategoryIcon category={item.category} className="h-8 w-8 text-white" />
                              </div>
                            </div>
                            <p className="text-white font-bold text-center text-base font-sans tracking-tight">
                              {config.label}
                            </p>
                            <p className="text-white/80 text-sm mt-2 text-center font-sans tracking-tight">
                              {item.aiTags.slice(0, 2).join(", ")}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="text-center p-6">
                          <p className="text-white font-bold text-lg font-sans tracking-tight mb-2">Zobrazit detail</p>
                          <p className="text-white/80 text-base font-sans tracking-tight">
                            {item.category.toLowerCase().replace("_", " ")}
                          </p>
                          {item.aiSaliencyScore && (
                            <div className="mt-3">
                              <Badge className="bg-white/20 text-white border-0 text-xs font-sans tracking-tight">
                                AI Score: {Math.round(item.aiSaliencyScore * 100)}%
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  {/* Processing status indicator */}
                  {item.processingStatus !== "DONE" && (
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="secondary" className="text-xs font-sans tracking-tight animate-pulse bg-white/20 text-white border-0">
                        {item.processingStatus === "PROCESSING" ? "⟳ Zpracovává se..." : "⏳ Čeká"}
                      </Badge>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </>
      )}

      {media.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-2xl border-gray-300 dark:border-gray-700">
          <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <p className="text-muted-foreground text-xl font-sans tracking-tight">Zatím žádné fotografie</p>
          <p className="text-base text-muted-foreground mt-3 font-sans tracking-tight">
            Nahrajte fotografie pro automatické zpracování AI
          </p>
        </div>
      )}
    </div>
  );
}