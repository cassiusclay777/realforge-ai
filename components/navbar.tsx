"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Building2, Image, Users, BarChart, Settings, Menu, X, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", icon: Home, href: "/" },
    { label: "Listings", icon: Building2, href: "/listings" },
    { label: "Media", icon: Image, href: "/media" },
    { label: "CRM", icon: Users, href: "/crm" },
    { label: "Analytics", icon: BarChart, href: "/analytics" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
              <span className="font-bold text-white">R</span>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold tracking-tight">REALFORGE</span>
                <span className="text-xl font-bold text-blue-600">AI</span>
              </div>
              <p className="text-xs text-muted-foreground">One-click real estate engine</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    "data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* User Profile & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <User className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden",
            "fixed inset-x-0 top-16 z-40 h-[calc(100vh-4rem)]",
            "bg-background border-t transition-all duration-300 ease-in-out",
            isMenuOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0 pointer-events-none"
          )}
        >
          <div className="flex flex-col p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closeMenu}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    "data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
            
            <div className="mt-6 border-t pt-4">
              <Button variant="outline" className="w-full justify-start gap-3">
                <User className="h-5 w-5" />
                Profile Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}