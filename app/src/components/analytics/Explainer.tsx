"use client";

import { useState, useRef, useEffect } from "react";
import { HelpCircle } from "lucide-react";
import { lookupGlossary } from "@/lib/financialGlossary";
import { cn } from "@/lib/utils";

interface ExplainerProps {
  term: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Lightweight hover/tap popover for financial jargon.
 * Pass `term` matching a key in financialGlossary.ts. The visible text
 * (via `children`) stays the same; only an info icon is added.
 */
export function Explainer({ term, children, className }: ExplainerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const entry = lookupGlossary(term);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (!entry) return <span className={className}>{children ?? term}</span>;

  return (
    <span ref={ref} className={cn("relative inline-flex items-center gap-1", className)}>
      <span>{children ?? entry.term}</span>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-label={`What is ${entry.term}?`}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground/60 hover:text-primary transition-colors cursor-help"
      >
        <HelpCircle className="h-3 w-3" />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-border bg-popover p-3 shadow-lg text-left"
        >
          <span className="block text-xs font-semibold text-foreground">{entry.term}</span>
          <span className="mt-1 block text-xs text-foreground/70 font-display italic leading-relaxed">
            {entry.short}
          </span>
          {entry.example && (
            <span className="mt-2 block text-[11px] text-muted-foreground leading-relaxed">
              Example: {entry.example}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
