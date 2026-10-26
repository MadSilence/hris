"use client";

import React, { useRef } from "react";
import { Input } from "@/public/desact/src/components/ui/input";
import { PLACEHOLDER_LABELS } from "@/models/automations";
import { insertPlaceholder } from "./draft";
import { Field } from "./SentenceCard";

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

  const insert = (name: string) => {
    const el = ref.current;
    const { text, caret } = insertPlaceholder(value, name, el?.selectionStart, el?.selectionEnd);
    onChange(text);
    // After React writes the new value, put the caret after the token, as typing would.
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(caret, caret);
    });
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
          onChange={(e) => onChange(e.target.value)}
          className="flex min-h-20 w-full resize-y rounded-lg border border-brown-300 bg-input-background px-3 py-3 text-base outline-none transition-[color,box-shadow] hover:border-brown-400 focus:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm"
        />
      ) : (
        <Input id={id} ref={ref} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Insert into ${label}`}>
        {placeholders.map((p) => (
          <button
            key={p}
            type="button"
            // Keep the focus (and the selection) in the field while the chip is pressed.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => insert(p)}
            className="rounded-md border border-brown-100 bg-brown-50/60 px-2 py-0.5 text-xs text-brown-700 hover:border-brown-200 hover:bg-brown-100"
          >
            {PLACEHOLDER_LABELS[p] ?? p}
          </button>
        ))}
      </div>
    </Field>
  );
}
