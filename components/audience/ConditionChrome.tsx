"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Add01Icon, ArrowDown01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/desact/popover";
import { cn } from "@/lib/cn";

/*
 * The look of a condition, for the whole product (the filter, `hris/design/screens/filter`, N09b–N09d; and the
 * automations editor before it — PRODUCT-RULES § Controls, the designers' fixes D1–D7). Moved here from the automations
 * settings on 2026-11-20 so the People table, the calendar, Attendance and automations draw one filter:
 *
 * - each condition a Mist card, radius 10, 8 6 8 8 inside — on ONE line where there is room (field 150 · operator 96 ·
 *   value the rest · ×), on two in a narrow panel (the field and ×, then the operator and the value);
 * - the controls inside it 28 high and white (`compactTrigger`);
 * - "and" centred between two hairlines — a flat AND list, no And / Or and no groups (owner, 2026-11-18);
 * - "Add a condition", an accent text link that opens the field list at once.
 */

/** An outlined box around a list of conditions (automations' "Who it runs for"): radius 10, 12 inside. */
export const ConditionGroup: React.FC<{ children: React.ReactNode; nested?: boolean; className?: string }> = ({
  children,
  nested = false,
  className,
}) => (
  <div
    role="group"
    className={cn(
      "flex flex-col gap-2.5 rounded-popover border p-3",
      nested ? "border-dashed border-strong" : "border-divider",
      className,
    )}
  >
    {children}
  </div>
);

export type ConditionLayout = "line" | "stacked";

/**
 * One condition. `first` is the field, `second` the operator and the value.
 *
 * - `line` (N09b, a wide popover): one row — the field 150, then `second` taking the rest, then ×;
 * - `stacked` (a side window ~320–400): the field and ×, then the operator and the value, ending under the field (D4).
 */
export const ConditionCard: React.FC<{
  first: React.ReactNode;
  second: React.ReactNode;
  onRemove?: () => void;
  removeLabel: string;
  layout?: ConditionLayout;
}> = ({ first, second, onRemove, removeLabel, layout = "stacked" }) => {
  const remove = onRemove && (
    <Button type="button" variant="ghost" onClick={onRemove} aria-label={removeLabel} className="size-7 shrink-0 p-0 text-tertiary">
      <Icon icon={Cancel01Icon} size="sm" className="size-3.5" />
    </Button>
  );
  if (layout === "line") {
    return (
      <div className="flex items-center gap-2 rounded-popover bg-mist py-2 pr-1.5 pl-2">
        <div className="w-[150px] shrink-0">{first}</div>
        <div className="flex min-w-0 flex-1 items-center gap-2">{second}</div>
        {remove}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1.5 rounded-popover bg-mist py-2 pr-1.5 pl-2">
      <div className="flex items-center gap-1.5">
        <div className="min-w-0 flex-1">{first}</div>
        {remove}
      </div>
      {/* D4: the operator and the value end under the field — the row stops where the remove button starts. */}
      <div className={cn("flex min-w-0 items-center gap-1.5", onRemove && "pr-[34px]")}>{second}</div>
    </div>
  );
};

export type Joiner = "AND" | "OR";

/** "and", 12/16 tertiary, centred with a 1 px hairline each side — the only joiner there is. */
export const ConditionJoiner: React.FC<{ value?: Joiner }> = () => {
  const t = useTranslations("access");
  return (
    <div className="flex items-center gap-2">
      <span className="h-px flex-1 bg-divider" />
      <span className="text-hint text-tertiary">{t("audience.builder.and")}</span>
      <span className="h-px flex-1 bg-divider" />
    </div>
  );
};

/** "Add a condition": a text link in the accent, 13/18 500, a 14 plus 6 before it, no box. */
export const AddConditionButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex h-[18px] w-fit items-center gap-1.5 rounded-tag text-label text-accent-text outline-none hover:underline focus-visible:underline"
  >
    <Icon icon={Add01Icon} size="sm" className="size-3.5" />
    {children}
  </button>
);

/** The small white control inside a condition card (D3): 28 high, radius 8, 0 8 0 10 inside, 13/18 400, chevron 12. */
export const compactTrigger = cn(
  "flex h-7 min-w-0 items-center justify-between gap-1.5 rounded-control border border-field bg-card pr-2 pl-2.5 text-label font-normal text-primary",
  "outline-none transition-colors hover:border-strong focus-visible:border-accent focus-visible:shadow-focus",
  "data-[state=open]:border-accent data-[state=open]:shadow-focus",
);

/**
 * The operator or the value of a condition whose field is not picked yet (D5): it looks like any select — nothing is
 * shown disabled — and pressing it opens the field list first.
 */
export const PendingPick: React.FC<{ placeholder: string; ariaLabel: string; onPress: () => void; className?: string }> = ({
  placeholder,
  ariaLabel,
  onPress,
  className,
}) => (
  <button type="button" aria-label={ariaLabel} onClick={onPress} className={cn(compactTrigger, "w-full", className)}>
    <span className="truncate text-tertiary">{placeholder}</span>
    <Icon icon={ArrowDown01Icon} size="sm" className="size-3 shrink-0 text-tertiary" />
  </button>
);

export type CompactSelectOption = {
  value: string;
  label: string;
  hint?: string;
  icon?: React.ReactNode;
  /** A hairline before it (C32). */
  separatorBefore?: boolean;
};

/**
 * A short list that is not searched — an operator, a frequency: the compact trigger and a plain list, each option its
 * name and, when it has one, a hint under it.
 */
export const CompactSelect: React.FC<{
  options: CompactSelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel: string;
  disabled?: boolean;
  invalid?: boolean;
  /** `md` is the 36-high select of a window (C5). */
  size?: "sm" | "md";
  className?: string;
  /** Classes for the open list — a width the trigger's would cut short. */
  listClassName?: string;
  /** The text the closed select shows, over the picked option's label. */
  triggerLabel?: string | null;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}> = ({
  options,
  value,
  onChange,
  placeholder,
  ariaLabel,
  disabled,
  invalid,
  size = "sm",
  className,
  listClassName,
  triggerLabel,
  defaultOpen = false,
  open: openFromOutside,
  onOpenChange,
}) => {
  const [openInside, setOpenInside] = React.useState(defaultOpen);
  const open = openFromOutside ?? openInside;
  const setOpen = (next: boolean) => {
    setOpenInside(next);
    onOpenChange?.(next);
  };
  const picked = options.find((o) => o.value === value) ?? null;
  const shown = triggerLabel ?? picked?.label ?? null;

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          className={cn(
            compactTrigger,
            "w-full aria-invalid:border-danger",
            // C5: the window's select — 36 high, 0 12 inside, 8 between its parts, a 16 chevron.
            size === "md" && "h-9 gap-2 px-3 text-body",
            className,
          )}
        >
          <span className="flex min-w-0 items-center gap-1.5">
            {picked?.icon}
            <span className={cn("truncate", !shown && "text-tertiary")}>{shown ?? placeholder}</span>
          </span>
          <Icon icon={ArrowDown01Icon} size="sm" className={cn("shrink-0 text-tertiary", size === "sm" && "size-3")} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className={cn("w-[var(--radix-popover-trigger-width)] min-w-40 rounded-popover p-1", listClassName)}>
        <div role="listbox" aria-label={ariaLabel} className="flex flex-col gap-0.5">
          {options.map((o) => (
            <React.Fragment key={o.value}>
              {o.separatorBefore && <div role="separator" className="my-1 h-px bg-divider" />}
              <button
                type="button"
                role="option"
                aria-selected={o.value === value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex flex-col items-start gap-0.5 rounded-control px-2 py-1.5 text-left outline-none hover:bg-accent-subtle focus-visible:bg-accent-subtle",
                  o.value === value && "bg-accent-subtle",
                )}
              >
                <span className="flex items-center gap-2 text-body text-primary">
                  {o.icon}
                  {o.label}
                </span>
                {o.hint && <span className="text-hint text-tertiary">{o.hint}</span>}
              </button>
            </React.Fragment>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
