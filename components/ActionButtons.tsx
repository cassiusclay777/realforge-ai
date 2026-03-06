"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Share2, Upload, Globe, FileText, Mail, Download, ExternalLink, Link } from "lucide-react";

interface ActionButtonsProps {
  className?: string;
  onExportToSreality?: () => void;
  onExportToPoski?: () => void;
  onShareSocial?: () => void;
  onExportPDF?: () => void;
  onEmailCampaign?: () => void;
  onDownloadAll?: () => void;
  onPreviewWebsite?: () => void;
  onCopyLink?: () => void;
  disabled?: boolean;
}

export default function ActionButtons({
  className,
  onExportToSreality,
  onExportToPoski,
  onShareSocial,
  onExportPDF,
  onEmailCampaign,
  onDownloadAll,
  onPreviewWebsite,
  onCopyLink,
  disabled = false,
}: ActionButtonsProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Hlavní akční tlačítka - PREMIUM */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Export to Sreality - zlaté tlačítko PREMIUM */}
        <Button
          onClick={onExportToSreality}
          disabled={disabled}
          className={cn(
            "h-20 relative overflow-hidden group",
            "bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700",
            "hover:from-amber-600 hover:via-amber-700 hover:to-amber-800",
            "text-white font-bold text-xl font-sans tracking-tight",
            "border-2 border-amber-400/40",
            "shadow-2xl shadow-amber-500/40",
            "transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/60",
            "active:scale-95",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 bg-amber-500/20 blur-xl group-hover:bg-amber-500/30 transition-all duration-500"></div>
          
          <div className="relative flex items-center justify-center gap-4">
            <span className="text-3xl">🇨🇿</span>
            <div className="text-left">
              <div className="font-bold text-lg font-sans tracking-tight">Export to Sreality</div>
              <div className="text-sm font-normal opacity-90 font-sans tracking-tight">Czech real estate platform</div>
            </div>
            <Upload className="h-6 w-6 ml-2 group-hover:animate-bounce" />
          </div>
        </Button>

        {/* Export to Poski - zelené tlačítko PREMIUM */}
        <Button
          onClick={onExportToPoski}
          disabled={disabled}
          className={cn(
            "h-20 relative overflow-hidden group",
            "bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700",
            "hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-800",
            "text-white font-bold text-xl font-sans tracking-tight",
            "border-2 border-emerald-400/40",
            "shadow-2xl shadow-emerald-500/40",
            "transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/60",
            "active:scale-95",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl group-hover:bg-emerald-500/30 transition-all duration-500"></div>
          
          <div className="relative flex items-center justify-center gap-4">
            <span className="text-3xl">🏢</span>
            <div className="text-left">
              <div className="font-bold text-lg font-sans tracking-tight">Export to Poski</div>
              <div className="text-sm font-normal opacity-90 font-sans tracking-tight">Professional real estate platform</div>
            </div>
            <Upload className="h-6 w-6 ml-2 group-hover:animate-bounce" />
          </div>
        </Button>

        {/* Share on Social - modré tlačítko PREMIUM */}
        <Button
          onClick={onShareSocial}
          disabled={disabled}
          className={cn(
            "h-20 relative overflow-hidden group",
            "bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700",
            "hover:from-blue-600 hover:via-blue-700 hover:to-blue-800",
            "text-white font-bold text-xl font-sans tracking-tight",
            "border-2 border-blue-400/40",
            "shadow-2xl shadow-blue-500/40",
            "transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/60",
            "active:scale-95",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 bg-blue-500/20 blur-xl group-hover:bg-blue-500/30 transition-all duration-500"></div>
          
          <div className="relative flex items-center justify-center gap-4">
            <span className="text-3xl">🌐</span>
            <div className="text-left">
              <div className="font-bold text-lg font-sans tracking-tight">Share on Social</div>
              <div className="text-sm font-normal opacity-90 font-sans tracking-tight">Facebook, Instagram, LinkedIn</div>
            </div>
            <Share2 className="h-6 w-6 ml-2 group-hover:animate-bounce" />
          </div>
        </Button>
      </div>

      {/* Sekundární akční tlačítka - PREMIUM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={onExportPDF}
          disabled={disabled}
          variant="outline"
          className="h-14 group hover:bg-primary/5 transition-all duration-300 hover:scale-[1.02] border-2"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <FileText className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-medium text-base font-sans tracking-tight">Export PDF Report</span>
          </div>
        </Button>

        <Button
          onClick={onEmailCampaign}
          disabled={disabled}
          variant="outline"
          className="h-14 group hover:bg-primary/5 transition-all duration-300 hover:scale-[1.02] border-2"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Mail className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-medium text-base font-sans tracking-tight">Email Campaign</span>
          </div>
        </Button>
      </div>

      {/* Quick actions bar - PREMIUM */}
      <div className="pt-6 border-t border-primary/20">
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={onDownloadAll}
            size="sm"
            variant="ghost"
            className="text-sm hover:bg-muted font-sans tracking-tight group"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Download className="h-3.5 w-3.5 text-primary" />
              </div>
              <span>Download All</span>
            </div>
          </Button>
          <Button
            onClick={onPreviewWebsite}
            size="sm"
            variant="ghost"
            className="text-sm hover:bg-muted font-sans tracking-tight group"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <ExternalLink className="h-3.5 w-3.5 text-primary" />
              </div>
              <span>Preview Website</span>
            </div>
          </Button>
          <Button
            onClick={onCopyLink}
            size="sm"
            variant="ghost"
            className="text-sm hover:bg-muted font-sans tracking-tight group"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Link className="h-3.5 w-3.5 text-primary" />
              </div>
              <span>Copy Link</span>
            </div>
          </Button>
        </div>
      </div>

      {/* Status info - PREMIUM */}
      <div className="text-sm text-muted-foreground pt-4 border-t border-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-3 h-3 rounded-full",
              disabled ? "bg-amber-500 animate-pulse" : "bg-green-500"
            )}></div>
            <p className="font-sans tracking-tight">
              {disabled ? "Processing in progress..." : "Ready for export • All AI content generated"}
            </p>
          </div>
          <div className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-sans tracking-tight">
            {disabled ? "WAITING" : "READY"}
          </div>
        </div>
      </div>

      {/* Premium badge */}
      <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 p-4 rounded-xl border border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20">
            <span className="text-amber-600 text-xl">✨</span>
          </div>
          <div>
            <h4 className="font-bold text-amber-700 font-sans tracking-tight">Premium AI Processing</h4>
            <p className="text-sm text-amber-600/80 font-sans tracking-tight">
              Všechny fotografie jsou analyzovány AI pro optimalizaci obsahu a maximální konverzi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}