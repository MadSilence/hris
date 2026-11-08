"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Input } from "@/components/desact/input";
import { FieldError } from "@/components/desact/field-error";
import { NodRing } from "@/components/desact/nod";
import { Button } from "@/components/desact/button";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { cn } from "@/lib/cn";

/*
 * The small pieces every settings window is built from (`automations-triggers` § Values): fields full width, labels
 * 13/18 500, hints 12/16 tertiary, 16 between fields, a hairline between parts and no section headings.
 */

/** A window's fields, 16 apart. */
export const FieldStack: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("flex flex-col gap-4", className)}>{children}</div>
);

/** The hairline between the parts of a window — the only thing that separates them (no headings). */
export const PartDivider: React.FC = () => <div role="separator" className="-mx-5 h-px bg-divider" />;

/** A label over a control, the hint under it; the error replaces the hint (SPEC § 13.3). */
export const Field: React.FC<{
  label?: React.ReactNode;
  htmlFor?: string;
  labelId?: string;
  required?: boolean;
  hint?: React.ReactNode;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
}> = ({ label, htmlFor, labelId, required, hint, error, children, className }) => (
  <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
    {label != null && (
      <RequiredLabel htmlFor={htmlFor} required={required} className="text-label">
        <span id={labelId}>{label}</span>
      </RequiredLabel>
    )}
    {children}
    {error ? <FieldError className="mt-0">{error}</FieldError> : hint ? <Hint>{hint}</Hint> : null}
  </div>
);

export const Hint: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <p className={cn("text-hint text-tertiary", className)}>{children}</p>
);

/** A grey line that says what something does when there is nothing to set. */
export const GreyLine: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <p className={cn("text-body text-secondary", className)}>{children}</p>
);

/**
 * The Mist note (`automations-steps` § Values): Mist, radius 8, 10 × 12 inside, a 16 info icon in tertiary and 13/18
 * secondary text — `InlineAlert`'s info message in the neutral look the design draws.
 */
export const MistNote: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div role="note" className={cn("flex items-start gap-2 rounded-control bg-mist px-3 py-2.5 text-label font-normal text-secondary", className)}>
    <Icon icon={InformationCircleIcon} size="sm" className="mt-px shrink-0 text-tertiary" />
    <div className="min-w-0">{children}</div>
  </div>
);

/** The "Custom" marker beside a company's own field: a gray tag, size S (§ 4.7, § 13.4). */
export const CustomTag: React.FC = () => {
  const t = useTranslations("automationsSettings");
  return (
    <span className="inline-flex h-5 shrink-0 items-center rounded-tag bg-mist px-1.5 text-hint font-medium text-secondary">
      {t("common.custom")}
    </span>
  );
};

/** Under Later and other picked radio options: the extra settings, 24 in from the radio's left edge. */
export const Indented: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("ml-6 flex flex-col gap-3", className)}>{children}</div>
);

const toWhole = (raw: string): number | null => {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return null;
  return Math.min(Number(digits), 9999);
};

/**
 * A typed number with its unit inside the field ("[14 days]", "[30 days]") — a number is typed, never a dropdown
 * (PRODUCT-RULES § Controls). The unit follows the number's plural.
 */
export const DaysInput: React.FC<{
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
}> = ({ value, onChange, id, disabled, invalid, "aria-label": ariaLabel, "aria-labelledby": labelledBy, className }) => {
  const t = useTranslations("automationsSettings");
  return (
    <div className={cn("relative w-24 shrink-0", className)}>
      <Input
        id={id}
        inputMode="numeric"
        value={value == null ? "" : String(value)}
        onChange={(e) => onChange(toWhole(e.target.value))}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        className="pr-12 tabular-nums"
      />
      <span className={cn("pointer-events-none absolute inset-y-0 right-3 flex items-center text-body", disabled ? "text-disabled" : "text-tertiary")}>
        {t("common.daysUnit", { count: value ?? 0 })}
      </span>
    </div>
  );
};

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Reads "9", "930", "9:30", "09.30" as a time; null when it is none. */
export const parseTime = (raw: string): string | null => {
  const s = raw.trim().replace(/[.\s]/g, ":");
  let h: number;
  let m: number;
  const colon = /^(\d{1,2}):(\d{1,2})$/.exec(s);
  if (colon) {
    h = Number(colon[1]);
    m = Number(colon[2]);
  } else if (/^\d{1,4}$/.test(s)) {
    if (s.length <= 2) {
      h = Number(s);
      m = 0;
    } else {
      h = Number(s.slice(0, s.length - 2));
      m = Number(s.slice(-2));
    }
  } else {
    return null;
  }
  if (h > 23 || m > 59) return null;
  const out = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  return TIME.test(out) ? out : null;
};

/**
 * "At [09:00]": a time is typed (PRODUCT-RULES § Controls). It is read when the field is left; what cannot be read
 * as a time stays as typed and is marked.
 */
export const TimeInput: React.FC<{
  value: string | null | undefined;
  onChange: (value: string) => void;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}> = ({ value, onChange, id, disabled, invalid, "aria-label": ariaLabel, "aria-labelledby": labelledBy }) => {
  const [draft, setDraft] = React.useState(value ?? "");
  const [bad, setBad] = React.useState(false);
  React.useEffect(() => {
    setDraft(value ?? "");
    setBad(false);
  }, [value]);
  const commit = () => {
    const parsed = parseTime(draft);
    if (parsed) {
      setBad(false);
      setDraft(parsed);
      if (parsed !== value) onChange(parsed);
    } else {
      setBad(draft.trim().length > 0);
    }
  };
  return (
    <Input
      id={id}
      inputMode="numeric"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
      }}
      disabled={disabled}
      aria-invalid={bad || invalid || undefined}
      aria-label={ariaLabel}
      aria-labelledby={labelledBy}
      className="w-24 tabular-nums"
    />
  );
};

/** Inside an open list: the options are on their way. */
export const ListLoading: React.FC = () => (
  <div className="flex justify-center py-6">
    <NodRing size="md" />
  </div>
);

/** Inside an open list: the options could not be read. */
export const ListError: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
  const t = useTranslations("automationsSettings");
  return (
    <div className="flex flex-col items-center gap-1 px-3 py-5 text-center text-body text-secondary">
      <span>{t("common.loadError")}</span>
      <Button type="button" variant="link" size="sm" onClick={onRetry}>
        {t("common.retry")}
      </Button>
    </div>
  );
};
