"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Building2,
  Upload,
  Image,
  Users,
  BarChart,
  Settings,
  Zap,
  Globe,
  ChevronLeft,
  ChevronRight,
  User,
  Bell,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  const workspaceItems = [
    { label: "Dashboard", icon: Home, href: "/dashboard" },
    { label: "Listings", icon: Building2, href: "/listings" },
    { label: "Nahrát ZIP", icon: Upload, href: "/upload" },
    { label: "CRM", icon: Users, href: "/crm" },
    { label: "Media", icon: Image, href: "/media" },
    { label: "Analytics", icon: BarChart, href: "/analytics" },
  ];

  const operationsItems = [
    { label: "Automations", icon: Zap, href: "/automations" },
    { label: "Integrations", icon: Globe, href: "/integrations" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-background" suppressHydrationWarning>
      {/* Top bar: jen logo + uživatel (navigace je v sidebaru) */}
      <header className="fixed top-0 left-0 right-0 h-14 border-b border-border bg-background/95 backdrop-blur z-50" suppressHydrationWarning>
        <div className="h-full flex items-center justify-between px-4 md:px-6">
          <Link href="/dashboard" className="flex items-center gap-2.5" suppressHydrationWarning>
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-bold text-primary-foreground text-sm">R</span>
            </div>
            <span className="font-semibold tracking-tight text-foreground">
              REALFORGE <span className="text-primary">AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
              <Link href="/settings">
                <User className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="min-h-screen w-full pt-14">
        <aside className={cn(
          "fixed left-0 top-14 bottom-0 border-r border-border bg-card/50 transition-all duration-200 z-40",
          sidebarCollapsed ? "w-16" : "w-56"
        )}>
          <div className="flex flex-col h-full py-4 pl-3 pr-2">
            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-2.5 top-5 h-6 w-6 rounded-full border border-border bg-background shadow-sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label={sidebarCollapsed ? "Rozbalit menu" : "Sbalit menu"}
            >
              {sidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </Button>

            <nav className="flex-1 overflow-y-auto" suppressHydrationWarning>
              <div className="mb-6">
                <h3 className={cn(
                  "text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2",
                  sidebarCollapsed && "sr-only"
                )}>
                  {sidebarCollapsed ? "" : "Hlavní"}
                </h3>
              <div className="space-y-1">
                {workspaceItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors border-l-2 -ml-px pl-3",
                        isActive
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-transparent hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>

              <div className="mb-6">
                <h3 className={cn(
                  "text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2",
                  sidebarCollapsed && "sr-only"
                )}>
                  {sidebarCollapsed ? "" : "Operace"}
                </h3>
              <div className="space-y-1">
                {operationsItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors border-l-2 -ml-px pl-3",
                        isActive
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-transparent hover:bg-accent hover:text-accent-foreground"
                      )}
                      suppressHydrationWarning
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
            </nav>

            <div className={cn(
              "mt-auto pt-4 border-t border-border",
              sidebarCollapsed && "px-2"
            )}>
              {!sidebarCollapsed ? (
                <Link href="/settings/billing" className="block rounded-lg p-3 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors" suppressHydrationWarning>
                  <span className="font-medium text-foreground">Pro Plan</span>
                  <span className="block text-xs mt-0.5">1 999 Kč/měsíc</span>
                </Link>
              ) : (
                <Link href="/settings/billing" className="flex justify-center p-2 text-muted-foreground hover:text-foreground" suppressHydrationWarning>
                  <BarChart className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </aside>

        {/* Main: z-0 so fixed sidebar (z-40) always layers above; padding-left makes room for fixed sidebar */}
        <main
          className={cn(
            "min-w-0 overflow-auto relative z-0 transition-[padding-left] duration-200",
            sidebarCollapsed ? "pl-16" : "pl-56"
          )}
          suppressHydrationWarning
        >
          <div className="w-full px-4 md:px-6 py-6 md:py-8" suppressHydrationWarning>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}