"use client";

import { cn } from "@/lib/utils";

interface CategoryIconProps {
  category: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function CategoryIcon({ category, className, size = "md" }: CategoryIconProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const iconClass = cn(sizeClasses[size], className);

  // Kitchen icon
  if (category === "KITCHEN") {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 2h18v2H3V2zm0 4h18v2H3V6zm0 4h18v2H3v-2zm0 4h18v2H3v-2zm0 4h18v2H3v-2z"/>
        <path d="M5 8h2v2H5V8zm0 4h2v2H5v-2zm0 4h2v2H5v-2z"/>
      </svg>
    );
  }

  // Bedroom icon
  if (category === "BEDROOM") {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
        <path d="M2 4h20v14H2V4zm2 2v10h16V6H4z"/>
        <path d="M6 8h12v2H6V8zm0 4h12v2H6v-2z"/>
        <circle cx="4" cy="4" r="1"/>
        <circle cx="20" cy="4" r="1"/>
      </svg>
    );
  }

  // Bathroom icon
  if (category === "BATHROOM") {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 2h8v2H8V2zm4 4c3.31 0 6 2.69 6 6v8H6v-8c0-3.31 2.69-6 6-6zm0 2c-2.21 0-4 1.79-4 4v6h8v-6c0-2.21-1.79-4-4-4z"/>
        <circle cx="12" cy="12" r="1"/>
        <circle cx="9" cy="12" r="1"/>
        <circle cx="15" cy="12" r="1"/>
      </svg>
    );
  }

  // Living room icon
  if (category === "LIVING_ROOM") {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 4h16v12H4V4zm2 2v8h12V6H6z"/>
        <path d="M8 8h8v2H8V8zm0 4h8v2H8v-2z"/>
        <path d="M2 18h20v2H2v-2z"/>
      </svg>
    );
  }

  // Facade icon
  if (category === "FACADE") {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7v13h20V7L12 2zm0 2.8L18 7v11H6V7l6-4.2z"/>
        <path d="M8 9h8v2H8V9zm0 4h8v2H8v-2z"/>
        <rect x="10" y="16" width="4" height="3"/>
      </svg>
    );
  }

  // Advertisement icon
  if (category === "ADVERTISEMENT") {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 4h16v2H4V4zm0 4h16v10H4V8zm2 2v6h12v-6H6z"/>
        <path d="M8 12h8v2H8v-2z"/>
        <path d="M9 10h2v2H9v-2zm4 0h2v2h-2v-2z"/>
      </svg>
    );
  }

  // Hidden icon
  if (category === "HIDDEN") {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 4C7 4 2.73 7.11 1 11.5 2.73 15.89 7 19 12 19s9.27-3.11 11-7.5C21.27 7.11 17 4 12 4zm0 13c-3.79 0-7.17-2.13-8.82-5.5C4.83 8.13 8.21 6 12 6s7.17 2.13 8.82 5.5C19.17 14.87 15.79 17 12 17z"/>
        <path d="M12 8.5c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5zm0 5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
      </svg>
    );
  }

  // Hallway icon
  if (category === "HALLWAY") {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 4h16v2H4V4zm0 4h16v10H4V8zm2 2v6h12v-6H6z"/>
        <rect x="8" y="11" width="8" height="2"/>
        <rect x="10" y="14" width="4" height="2"/>
      </svg>
    );
  }

  // Garden icon
  if (category === "GARDEN") {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V21h8v-6.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5 0 1.88-1.04 3.52-2.58 4.38L14 15h-4l-.42-1.62C8.04 12.52 7 10.88 7 9c0-2.76 2.24-5 5-5z"/>
        <path d="M10 9h4v2h-4z"/>
        <circle cx="9" cy="7" r="1"/>
        <circle cx="15" cy="7" r="1"/>
      </svg>
    );
  }

  // Default icon (home)
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3L2 12h3v8h14v-8h3L12 3zm0 2.8L18 10v8h-4v-4h-4v4H6v-8l6-6.2z"/>
    </svg>
  );
}

// Export individual icons as well
export function KitchenIcon({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  return <CategoryIcon category="KITCHEN" className={className} size={size} />;
}

export function BedroomIcon({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  return <CategoryIcon category="BEDROOM" className={className} size={size} />;
}

export function BathroomIcon({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  return <CategoryIcon category="BATHROOM" className={className} size={size} />;
}

export function LivingRoomIcon({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  return <CategoryIcon category="LIVING_ROOM" className={className} size={size} />;
}

export function FacadeIcon({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  return <CategoryIcon category="FACADE" className={className} size={size} />;
}

export function AdvertisementIcon({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  return <CategoryIcon category="ADVERTISEMENT" className={className} size={size} />;
}

export function HiddenIcon({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  return <CategoryIcon category="HIDDEN" className={className} size={size} />;
}

export function HallwayIcon({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  return <CategoryIcon category="HALLWAY" className={className} size={size} />;
}

export function GardenIcon({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  return <CategoryIcon category="GARDEN" className={className} size={size} />;
}
