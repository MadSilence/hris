"use client";

import React from "react";
import { Input } from "@/components/desact/input";
import { Textarea } from "@/components/desact/textarea";
import { Checkbox } from "@/components/desact/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/desact/radio-group";
import { DatePicker } from "@/components/ui/DatePicker";
import { cn } from "@/lib/cn";
import type { AnswerValue, ReviewQuestion, ScalePoint } from "@/models/reviews";

export type AnswerState = { value: AnswerValue; comment: string };

/** One question's answer control, by its type. A rating is a row of the cycle's points and a comment. */
export function AnswerField({ question: q, scale, value, disabled, invalid, onChange }: {
  question: ReviewQuestion;
  scale: ScalePoint[];
  value: AnswerState;
  disabled: boolean;
  invalid?: boolean;
  onChange: (next: AnswerState) => void;
}) {
  const id = `answer-${q.id}`;
  const set = (v: AnswerValue) => onChange({ ...value, value: v });

  switch (q.type) {
    case "RATING":
      return (
        <div className="space-y-2">
          <div role="radiogroup" aria-label={q.label} aria-invalid={invalid ? true : undefined}
            className={`grid gap-2 ${scale.length <= 5 ? "sm:grid-cols-5" : "sm:grid-cols-7"}`}>
            {scale.map((p) => {
              const on = value.value === p.value;
              return (
                <button key={p.value} type="button" role="radio" aria-checked={on} disabled={disabled}
                  onClick={() => set(on ? null : p.value)}
                  className={cn(
                    "rounded-control border px-2 py-2 text-center text-hint transition-colors",
                    on ? "border-accent bg-accent-subtle text-primary" : "border-divider text-tertiary hover:border-field",
                  )}>
                  <span className="block text-body font-semibold text-primary">{p.value}</span>
                  {p.label}
                </button>
              );
            })}
          </div>
          <Textarea rows={2} aria-label={`Comment on ${q.label}`} value={value.comment} disabled={disabled}
            onChange={(e) => onChange({ ...value, comment: e.target.value })} />
        </div>
      );
    case "LONG_TEXT":
      return <Textarea id={id} rows={5} aria-label={q.label} aria-invalid={invalid ? true : undefined}
        value={typeof value.value === "string" ? value.value : ""} disabled={disabled} onChange={(e) => set(e.target.value)} />;
    case "SHORT_TEXT":
      return <Input id={id} aria-label={q.label} aria-invalid={invalid ? true : undefined} className="max-w-lg"
        value={typeof value.value === "string" ? value.value : ""} disabled={disabled} onChange={(e) => set(e.target.value)} />;
    case "NUMBER":
      return <Input id={id} type="number" aria-label={q.label} aria-invalid={invalid ? true : undefined} className="max-w-xs"
        value={value.value === null || value.value === undefined ? "" : String(value.value)} disabled={disabled}
        onChange={(e) => set(e.target.value === "" ? null : Number(e.target.value))} />;
    case "DATE":
      return <DatePicker id={id} ariaLabel={q.label} className="max-w-xs" value={typeof value.value === "string" ? value.value : ""}
        disabled={disabled} clearable invalid={invalid} onChange={(v) => set(v || null)} />;
    case "YES_NO":
      return (
        <RadioGroup aria-label={q.label} disabled={disabled}
          value={value.value === true ? "yes" : value.value === false ? "no" : ""}
          onValueChange={(v) => set(v === "yes")} className="flex gap-6">
          <label className="flex items-center gap-2 text-body"><RadioGroupItem value="yes" />Yes</label>
          <label className="flex items-center gap-2 text-body"><RadioGroupItem value="no" />No</label>
        </RadioGroup>
      );
    case "SINGLE_CHOICE":
      return (
        <RadioGroup aria-label={q.label} disabled={disabled} value={typeof value.value === "string" ? value.value : ""}
          onValueChange={set} className="space-y-1.5">
          {(q.options ?? []).map((o) => (
            <label key={o} className="flex items-center gap-2 text-body"><RadioGroupItem value={o} />{o}</label>
          ))}
        </RadioGroup>
      );
    case "MULTIPLE_CHOICE": {
      const chosen = Array.isArray(value.value) ? value.value : [];
      return (
        <div className="space-y-1.5" role="group" aria-label={q.label}>
          {(q.options ?? []).map((o) => (
            <label key={o} className="flex items-center gap-2 text-body">
              <Checkbox checked={chosen.includes(o)} disabled={disabled}
                onCheckedChange={(c) => set(c === true ? [...chosen, o] : chosen.filter((x) => x !== o))} />
              {o}
            </label>
          ))}
        </div>
      );
    }
    default:
      return null;
  }
}
