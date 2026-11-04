"use client";

import React, { useRef, useState } from "react";
import { Input } from "@/components/desact/input";
import { PLACEHOLDER_LABELS } from "@/models/automations";
import { insertPlaceholder, mentionAt } from "./draft";
import { Field } from "./SentenceCard";

/** The words of an event's placeholders, beside the person's. */
const EVENT_PLACEHOLDER_LABELS: Record<string, string> = {
  leaveType: "Leave type",
  leaveStart: "Leave starts",
  leaveEnd: "Leave ends",
  leaveDays: "Leave days",
  processName: "Process name",
  processType: "Process type",
  reviewKind: "Review kind",
  cycleName: "Review cycle",
};
const labelOf = (p: string) => PLACEHOLDER_LABELS[p] ?? EVENT_PLACEHOLDER_LABELS[p] ?? p;

/**
 * A text an automation fills per person — a subject, a body, a task title. Placeholders are inserted
 * from chips at the caret, never typed by hand, so a misspelt `{fristName}` cannot get as far as the
 * publish refusal (research § A.10, "Variables").
 */
export function PlaceholderTextField({
  id,
  label,
  value,
  onChange,
  placeholders,
  multiline = false,
  required = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholders: string[];
  multiline?: boolean;
  required?: boolean;
}) {
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  // "@" opens the list of fields at the caret (A3); what is stored is still {name}.
  const [mention, setMention] = useState<{ start: number; query: string } | null>(null);
  const [active, setActive] = useState(0);
  const matches = mention
    ? placeholders.filter((p) => `${p} ${labelOf(p)}`.toLowerCase().includes(mention.query.toLowerCase()))
    : [];

  const type = (text: string, caret: number | null) => {
    onChange(text);
    setMention(caret == null ? null : mentionAt(text, caret));
    setActive(0);
  };

  const insert = (name: string) => {
    const el = ref.current;
    const from = mention ? mention.start : el?.selectionStart;
    const to = mention ? mention.start + mention.query.length + 1 : el?.selectionEnd;
    setMention(null);
    const { text, caret } = insertPlaceholder(value, name, from, to);
    onChange(text);
    // After React writes the new value, put the caret after the token, as typing would.
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(caret, caret);
    });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!mention || matches.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % matches.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a - 1 + matches.length) % matches.length); }
    else if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); insert(matches[active]); }
    else if (e.key === "Escape") { e.preventDefault(); setMention(null); }
  };

  return (
    <Field label={label} htmlFor={id} required={required}>
      {multiline ? (
        // The library Textarea is a plain function component and cannot take a ref under React 18; the
        // caret is the whole point here, so this is the same element with the same classes.
        <textarea
          id={id}
          ref={ref}
          rows={5}
          value={value}
          onChange={(e) => type(e.target.value, e.target.selectionStart)}
          onKeyDown={onKeyDown}
          className="flex min-h-20 w-full resize-y rounded-control border border-field bg-card px-3 py-3 text-body outline-none transition-[color,box-shadow] hover:border-strong focus:border-accent focus-visible:ring-[3px] focus-visible:ring-accent-ring/50 md:text-body"
        />
      ) : (
        <Input id={id} ref={ref} value={value} onChange={(e) => type(e.target.value, e.target.selectionStart)} onKeyDown={onKeyDown} />
      )}
      {mention && matches.length > 0 && (
        <ul role="listbox" aria-label={`Fields for ${label}`} className="m-0 max-h-56 list-none overflow-auto rounded-control border border-divider bg-card p-1 shadow-popover">
          {matches.map((p, i) => (
            <li key={p} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insert(p)}
                className={`w-full rounded-control px-2 py-1 text-left text-body ${i === active ? "bg-mist text-primary" : "text-secondary hover:bg-subtle"}`}
              >
                {labelOf(p)} <span className="text-hint text-tertiary">{`{${p}}`}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="m-0 text-hint text-tertiary">Type @ to insert a field — the first name, a date, the leave.</p>
    </Field>
  );
}
