"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/desact/input";
import { Checkbox } from "@/components/desact/checkbox";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { DatePicker } from "@/components/ui/DatePicker";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

/** A field a fill-in-fields task asks for, as either surface renders it. */
export type TaskField = {
  id: string;
  name: string | null;
  type: string | null;
  isRequired: boolean;
  isFilled: boolean;
  options: { id: string; label: string }[];
};

/**
 * The field types a task can ask for in place — on the preboarding page and in a task row. Anything else
 * (a person, a reference, an address, money, a repeatable object) has no form here: the preboarding template
 * refuses it, and the task row sends the reader to the profile instead.
 */
export const INLINE_FIELD_TYPES = new Set([
  "TEXT", "LONG_TEXT", "NUMBER", "EMAIL", "URL", "PHONE", "DATE", "CHECKBOX", "SELECT", "MULTI_SELECT",
]);

export const canFillInPlace = (fields: { type: string | null }[]) =>
  fields.length > 0 && fields.every((f) => f.type !== null && INLINE_FIELD_TYPES.has(f.type));

export function TaskFieldInput({ field, value, onChange, disabled }: {
  field: TaskField; value: unknown; onChange: (v: unknown) => void; disabled: boolean;
}) {
  const t = useTranslations("lifecycle");
  const id = `field-${field.id}`;
  const name = field.name ?? t("shared.field");
  const label = (
    <RequiredLabel htmlFor={id} required={field.isRequired}>
      {name}{field.isFilled ? " ✓" : ""}
    </RequiredLabel>
  );

  switch (field.type) {
    case "SELECT":
      return (
        <div className="space-y-1.5">
          {label}
          <SearchableSelect
            id={id}
            options={field.options.map((o) => ({ value: o.id, label: o.label }))}
            value={typeof value === "string" && value ? value : null}
            onChange={(v) => v && onChange(v)}
            placeholder={t("shared.selectPlaceholder")}
            disabled={disabled}
            clearable={false}
          />
        </div>
      );
    case "MULTI_SELECT": {
      const picked = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="space-y-1.5">
          {label}
          {field.options.map((o) => (
            <label key={o.id} className="flex items-center gap-2 text-body">
              <Checkbox
                checked={picked.includes(o.id)}
                disabled={disabled}
                onCheckedChange={(c) => onChange(c ? [...picked, o.id] : picked.filter((x) => x !== o.id))}
              />
              {o.label}
            </label>
          ))}
        </div>
      );
    }
    case "CHECKBOX":
      return (
        <label className="flex items-center gap-2 text-body">
          <Checkbox id={id} checked={value === true} disabled={disabled} onCheckedChange={(c) => onChange(c === true)} />
          {name}{field.isFilled ? " ✓" : ""}
        </label>
      );
    case "DATE":
      return (
        <div className="space-y-1.5">
          {label}
          <DatePicker id={id} value={typeof value === "string" ? value : ""} onChange={onChange} disabled={disabled} ariaLabel={name} />
        </div>
      );
    default:
      return (
        <div className="space-y-1.5">
          {label}
          <Input
            id={id}
            type={field.type === "NUMBER" ? "number" : field.type === "EMAIL" ? "email"
              : field.type === "URL" ? "url" : field.type === "PHONE" ? "tel" : "text"}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
        </div>
      );
  }
}
