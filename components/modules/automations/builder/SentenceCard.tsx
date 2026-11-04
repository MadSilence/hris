"use client";

import React from "react";
import { cn } from "@/lib/cn";
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
      <div className="rounded-card border border-divider bg-card p-5">
        <header className="mb-4 flex items-baseline gap-3">
          <span className="text-hint font-semibold text-tertiary">{word}</span>
          {summary ? <span className="min-w-0 truncate text-body text-tertiary">{summary}</span> : null}
        </header>
        <div className="space-y-4">{children}</div>
      </div>
      {!last && <div aria-hidden className="ml-8 h-5 w-px bg-divider" />}
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
      <RequiredLabel htmlFor={htmlFor} required={required} className="text-body font-normal text-tertiary">
        {label}
      </RequiredLabel>
      {children}
      {hint ? <p className="m-0 text-hint text-tertiary">{hint}</p> : null}
    </div>
  );
}
