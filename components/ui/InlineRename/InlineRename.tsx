"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

/** "contract.pdf" → ["contract", ".pdf"]; a name with no extension, or one that starts with a dot, keeps it all. */
export const splitExtension = (name: string): [string, string] => {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? [name.slice(0, dot), name.slice(dot)] : [name, ""];
};

/**
 * Whether an InlineRename field has the focus. A Radix dialog hears Escape on the document before the field does, so a
 * dialog holding one passes `onEscapeKeyDown={(e) => isEditingInline() && e.preventDefault()}` — Escape then cancels
 * the rename and leaves the dialog open (walk of 2026-11-18).
 */
export const isEditingInline = () =>
  typeof document !== "undefined" && document.activeElement instanceof HTMLElement && "inlineRename" in document.activeElement.dataset;

/**
 * A preview's title that renames in place (documents-tab T25–T26): one click turns the name into a field, the extension
 * kept outside it; Enter saves, Esc or a click outside cancels. On hover the name gets a soft background. Without
 * `onRename` it is plain text.
 */
export const InlineRename: React.FC<{
  name: string;
  onRename?: (next: string) => Promise<boolean> | boolean;
  className?: string;
}> = ({ name, onRename, className }) => {
  const t = useTranslations("common");
  const [editing, setEditing] = React.useState(false);
  const [base, ext] = splitExtension(name);
  const [value, setValue] = React.useState(base);
  const [busy, setBusy] = React.useState(false);
  const input = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => setValue(splitExtension(name)[0]), [name]);
  React.useEffect(() => {
    if (!editing) return;
    input.current?.focus();
    input.current?.select();
  }, [editing]);

  const cancel = () => {
    setValue(base);
    setEditing(false);
  };
  const save = async () => {
    const next = value.trim();
    if (!next || next === base || !onRename) return cancel();
    setBusy(true);
    const ok = await onRename(next + ext);
    setBusy(false);
    if (ok) setEditing(false);
  };

  if (!onRename) return <span className={cn("truncate", className)}>{name}</span>;
  if (!editing) {
    return (
      <button
        type="button"
        title={t("actions.rename")}
        onClick={() => setEditing(true)}
        className={cn("min-w-0 truncate rounded-tag px-1 text-left hover:bg-mist", className)}
      >
        {name}
      </button>
    );
  }
  return (
    <span className={cn("flex min-w-0 items-center gap-0.5", className)}>
      <input
        ref={input}
        // A dialog around it reads this to leave Escape to the field (`isEditingInline`).
        data-inline-rename=""
        aria-label={t("actions.rename")}
        value={value}
        disabled={busy}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => { if (!busy) cancel(); }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void save();
          } else if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            cancel();
          }
        }}
        className="min-w-0 flex-1 rounded-tag border border-field bg-card px-1 outline-none focus-visible:border-accent"
      />
      {ext && <span className="shrink-0 text-tertiary">{ext}</span>}
    </span>
  );
};
