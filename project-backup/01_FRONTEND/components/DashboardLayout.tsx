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
  Image, 
  Users, 
  BarChart, 
  Settings, 
  Zap, 
  Globe, 
  ChevronLeft, 
  ChevronRight,
  User,
  Upload,
  Bell,
  HelpCircle
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
    <div className="min-h-screen bg-background">
      {/* Fixed Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-16 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 z-50">
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="font-bold text-white text-lg">R</span>
            </div>
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "opacity-0 w-0" : "opacity-100")}>
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold tracking-tight">REALFORGE</span>
                <span className="text-xl font-bold text-primary">AI</span>
              </div>
            </div>
          </div>

          {/* Center: Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {workspaceItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right: User Profile */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive"></span>
            </Button>
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium">Jan Makléř</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">Senior Agent</p>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                    Pro
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar and Main Content */}
      <div className="flex pt-16">
        {/* Collapsible Sidebar */}
        <aside className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] border-r border-border bg-card transition-all duration-300 z-40",
          sidebarCollapsed ? "w-20" : "w-72"
        )}>
          <div className="flex flex-col h-full p-4">
            {/* Collapse Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-3 top-6 h-6 w-6 rounded-full border border-border bg-card"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-3 w-3" />
              ) : (
                <ChevronLeft className="h-3 w-3" />
              )}
            </Button>

            {/* Workspace Section */}
            <div className="mb-8">
              <h3 className={cn(
                "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3",
                sidebarCollapsed && "text-center"
              )}>
                {sidebarCollapsed ? "WS" : "Workspace"}
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
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Operations Section */}
            <div className="mb-8">
              <h3 className={cn(
                "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3",
                sidebarCollapsed && "text-center"
              )}>
                {sidebarCollapsed ? "OP" : "Operations"}
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
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Usage Panel */}
            <div className={cn(
              "mt-auto p-4 rounded-lg border border-border bg-gradient-to-br from-card to-accent/10 relative z-30",
              sidebarCollapsed && "p-3"
            )}>
              {!sidebarCollapsed ? (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Storage</span>
                    <span className="text-sm text-muted-foreground">85 GB / 100 GB</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden mb-3">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                      style={{ width: '85%' }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Pro Plan</p>
                      <p className="text-xs text-muted-foreground">1,999 Kč/měsíc</p>
                    </div>
                    <Link href="/settings/billing">
                      <Button variant="ghost" size="sm" className="text-xs">
                        Billing
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-2">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium">85%</div>
                    <div className="text-[10px] text-muted-foreground">Used</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={cn(
          "flex-1 transition-all duration-300 min-w-0 overflow-auto w-full",
          sidebarCollapsed ? "ml-20" : "ml-72"
        )}>
          <div className="w-full px-4 md:px-6 py-6 md:py-8 relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}