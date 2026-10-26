"use client";

import React from "react";
import { cn } from "@/public/desact/src/components/ui/utils";
import { RequiredLabel } from "@/components/ui/RequiredLabel";

/**
 * One clause of the rule's sentence — When, For Whom, Do — stacked and joined by a hairline, so the
 * three read top to bottom as one sentence (research § A.10). The summary line is the clause in
 * prose; the body is where it is edited.
 */
export function SentenceCard({
  word,
  summary,
  children,
  last = false,
  className,
}: {
  word: string;
  summary?: React.ReactNode;
  children: React.ReactNode;
  last?: boolean;
  className?: string;
}) {
  return (
    <section aria-label={word} className={cn("relative", className)}>
      <div className="rounded-xl border border-brown-100 bg-white p-5">
        <header className="mb-4 flex items-baseline gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-brown-500">{word}</span>
          {summary ? <span className="min-w-0 truncate text-sm text-muted-foreground">{summary}</span> : null}
        </header>
        <div className="space-y-4">{children}</div>
      </div>
      {!last && <div aria-hidden className="ml-8 h-5 w-px bg-brown-200" />}
    </section>
  );
}

/** A label above a control, the label in the muted small size the forms here use. */
export function Field({
  label,
  htmlFor,
  required = false,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <RequiredLabel htmlFor={htmlFor} required={required} className="text-sm font-normal text-muted-foreground">
        {label}
      </RequiredLabel>
      {children}
      {hint ? <p className="m-0 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
