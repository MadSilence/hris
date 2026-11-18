"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

/**
 * Six one-digit boxes (documents-signing G03a, G05): typing moves on by itself, Backspace moves back, a pasted code
 * fills them all, and the sixth digit sends it. `invalid` turns them red.
 */
export function CodeBoxes({
  onCompleteAction,
  invalid,
  disabled,
}: {
  onCompleteAction: (code: string) => void;
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
    if (invalid) {
      setDigits(["", "", "", "", "", ""]);
      refs.current[0]?.focus();
    }
  }, [invalid]);

  const set = (next: string[]) => {
    setDigits(next);
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
            "h-14 w-full min-w-0 max-w-12 flex-1 rounded-control border bg-card text-center font-mono text-card-title text-primary outline-none",
            "focus:border-accent focus:ring-2 focus:ring-accent-ring",
            invalid ? "border-danger-text" : "border-field",
          )}
        />
      ))}
    </div>
  );
}
