"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

/**
 * Six one-digit boxes (documents-signing G03a, G05): typing moves on by itself, Backspace moves back, a pasted code
 * fills them all, and the sixth digit sends it. `invalid` turns them red and keeps the digits (G05, 2026-11-20): the
 * signer sees what they typed; the first edit hands the boxes back (`onEditAction`).
 */
export function CodeBoxes({
  onCompleteAction,
  onEditAction,
  invalid,
  disabled,
}: {
  onCompleteAction: (code: string) => void;
  /** Any change to the digits — the screen clears its error on it. */
  onEditAction?: () => void;
  invalid?: boolean;
  disabled?: boolean;
}) {
  const t = useTranslations("signing");
  const [digits, setDigits] = React.useState<string[]>(["", "", "", "", "", ""]);
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  React.useEffect(() => {
    if (invalid) refs.current[5]?.focus();
  }, [invalid]);

  const set = (next: string[]) => {
    setDigits(next);
    onEditAction?.();
    if (next.every((d) => d !== "")) onCompleteAction(next.join(""));
  };

  const onChange = (i: number, raw: string) => {
    const only = raw.replace(/\D/g, "");
    if (only.length > 1) {
      // A pasted or autofilled code fills from here on.
      const next = [...digits];
      for (let k = 0; k < only.length && i + k < 6; k++) next[i + k] = only[k];
      set(next);
      refs.current[Math.min(5, i + only.length)]?.focus();
      return;
    }
    const next = [...digits];
    next[i] = only;
    set(next);
    if (only && i < 5) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  return (
    <div className="flex gap-2" role="group" aria-label={t("code.label")}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={6}
          aria-label={t("code.digit", { n: i + 1 })}
          aria-invalid={invalid || undefined}
          onChange={(e) => onChange(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          className={cn(
            "h-13 w-11 min-w-0 shrink rounded-control border bg-card text-center text-deck-line font-semibold outline-none",
            "focus:border-accent focus:ring-2 focus:ring-accent-ring",
            invalid ? "border-danger text-danger" : "border-field text-primary",
          )}
        />
      ))}
    </div>
  );
}
