"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const DEFAULT_MAX_LENGTH = 120;

interface ExpandableTextProps {
  text: string;
  /** Max characters to show when collapsed (default 120). */
  maxLength?: number;
  className?: string;
  /** Label for "show more" (default "zobrazit více") */
  moreLabel?: string;
  /** Label for "show less" (default "zobrazit méně") */
  lessLabel?: string;
}

export function ExpandableText({
  text,
  maxLength = DEFAULT_MAX_LENGTH,
  className,
  moreLabel = "zobrazit více",
  lessLabel = "zobrazit méně",
}: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);
  const shouldTruncate = text.length > maxLength;
  const displayText = expanded || !shouldTruncate ? text : `${text.slice(0, maxLength).trim()}…`;

  return (
    <div className={cn("text-sm text-muted-foreground", className)}>
      <span className="whitespace-pre-wrap">{displayText}</span>
      {shouldTruncate && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="ml-1 text-primary hover:underline font-medium"
        >
          {expanded ? lessLabel : moreLabel}
        </button>
      )}
    </div>
  );
}
