"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Building2, 
  Bell, 
  Globe, 
  CreditCard, 
  Shield, 
  Database,
  Save,
  X
} from "lucide-react";

interface SettingsLayoutProps {
  children: ReactNode;
  hasUnsavedChanges?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
}

export function SettingsLayout({ 
  children, 
  hasUnsavedChanges = false,
  onSave,
  onCancel 
}: SettingsLayoutProps) {
  const pathname = usePathname();

  const settingsTabs = [
    { label: "Profil", icon: User, href: "/settings", exact: true },
    { label: "Kancelář", icon: Building2, href: "/settings/office" },
    { label: "Notifikace", icon: Bell, href: "/settings/notifications" },
    { label: "Integrace", icon: Globe, href: "/settings/integrations" },
    { label: "Fakturace", icon: CreditCard, href: "/settings/billing" },
    { label: "Bezpečnost", icon: Shield, href: "/settings/security" },
    { label: "Správa dat", icon: Database, href: "/settings/data" },
  ];

  const isActive = (href: string, exact: boolean = false) => {
    if (exact) return pathname === href;
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Settings Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground mt-2">
                Spravujte nastavení účtu, notifikace a integrace
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                Exportovat nastavení
              </Button>
              <Button size="sm" onClick={onSave}>
                Uložit vše
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Vertical Tabs Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <nav className="space-y-1">
                {settingsTabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = isActive(tab.href, tab.exact);
                  return (
                    <Link
                      key={tab.label}
                      href={tab.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                        active
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span>{tab.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Help Section */}
              <div className="mt-8 p-4 rounded-lg border border-border bg-card">
                <h3 className="text-sm font-semibold mb-2">Potřebujete pomoc?</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Máte otázky k nastavení? Kontaktujte naši podporu.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Kontaktovat podporu
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            <div className="space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Sticky Bottom Bar for Unsaved Changes */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="container mx-auto px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-destructive animate-pulse"></div>
                <div>
                  <p className="font-medium">Máte neuložené změny</p>
                  <p className="text-sm text-muted-foreground">
                    Uložte změny před opuštěním stránky
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={onCancel}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Zrušit
                </Button>
                <Button 
                  onClick={onSave}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Uložit změny
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}