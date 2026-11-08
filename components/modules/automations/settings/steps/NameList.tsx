"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { cn } from "@/lib/cn";

/**
 * A free list of names as chips inside the field — Enter or a comma adds what was typed, Backspace in an empty field
 * takes the last one back. For "Ask to sign a document", whose documents are names until a documents module exists.
 */
export const NameList: React.FC<{
  value: string[];
  onChange: (value: string[]) => void;
  labelledBy?: string;
  invalid?: boolean;
}> = ({ value, onChange, labelledBy, invalid }) => {
  const t = useTranslations("automationsSettings");
  const [draft, setDraft] = React.useState("");
  const add = () => {
    const name = draft.trim();
    if (name && !value.includes(name)) onChange([...value, name]);
    setDraft("");
  };
  return (
    <div
      data-invalid={invalid || undefined}
      className={cn(
        "flex min-h-9 w-full flex-wrap items-center gap-1 rounded-control border border-field bg-card px-1.5 py-1",
        "focus-within:border-accent focus-within:shadow-focus data-[invalid]:border-danger",
      )}
    >
      {value.map((name) => (
        <span key={name} className="inline-flex h-6 max-w-full items-center gap-1 rounded-tag bg-mist pl-2 pr-0.5 text-label">
          <span className="max-w-48 truncate" title={name}>
            {name}
          </span>
          <button
            type="button"
            onClick={() => onChange(value.filter((n) => n !== name))}
            aria-label={t("people.removeNamed", { name })}
            className="inline-flex size-5 items-center justify-center rounded-control text-tertiary hover:bg-divider hover:text-secondary"
          >
            <Icon icon={Cancel01Icon} size="sm" />
          </button>
        </span>
      ))}
      <input
        aria-labelledby={labelledBy}
        aria-invalid={invalid || undefined}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={add}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        className="h-6 min-w-24 flex-1 bg-transparent px-1 text-body outline-none"
      />
    </div>
  );
};
