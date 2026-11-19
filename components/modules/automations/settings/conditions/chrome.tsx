"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Add01Icon, Cancel01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/desact/popover";
import { Combobox } from "@/components/ui/Combobox";
import { cn } from "@/lib/cn";
import { CustomTag, ListError, ListLoading } from "../parts/parts";

/*
 * The look of every condition in automations (PRODUCT-RULES § Controls, `automations-editor` § Values, the designers'
 * fixes D1–D7): an outlined box, radius 10, 12 inside, 10 between its parts; each condition a Mist card, radius 10,
 * 8 6 8 8 inside, on two lines — the field and its remove, then the operator and the value, 28 high and white, ending
 * under the field; "and" centred between hairlines. Conditions are a flat list joined by AND everywhere — there is no
 * And / Or switch and no group (owner, 2026-11-18).
 */

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

export const ConditionCard: React.FC<{
  first: React.ReactNode;
  second: React.ReactNode;
  onRemove?: () => void;
  removeLabel: string;
}> = ({ first, second, onRemove, removeLabel }) => (
  <div className="flex flex-col gap-1.5 rounded-popover bg-mist py-2 pr-1.5 pl-2">
    <div className="flex items-center gap-1.5">
      <div className="min-w-0 flex-1">{first}</div>
      {onRemove && (
        <Button type="button" variant="ghost" onClick={onRemove} aria-label={removeLabel} className="size-7 p-0 text-tertiary">
          <Icon icon={Cancel01Icon} size="sm" className="size-3.5" />
        </Button>
      )}
    </div>
    {/* D4: the operator and the value end under the field — the row stops where the remove button starts. */}
    <div className="flex min-w-0 items-center gap-1.5 pr-[34px]">{second}</div>
  </div>
);

export type Joiner = "AND" | "OR";

/** D6: "and", centred with a hairline each side — the only joiner there is. */
export const ConditionJoiner: React.FC<{ value?: Joiner }> = () => {
  const t = useTranslations("automationsSettings");
  return (
    <div className="flex items-center gap-2">
      <span className="h-px flex-1 bg-divider" />
      <span className="text-hint text-tertiary">{t("conditions.andLower")}</span>
      <span className="h-px flex-1 bg-divider" />
    </div>
  );
};

/** "Add a condition" (C11, D7): a text link in the accent, 13/18 500, a 14 plus 6 before it, no box. */
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

/** The small white control inside a condition card (D3): 28 high, radius 8, 0 8 0 10 inside, 13/18 400, chevron 12. */
export const compactTrigger = cn(
  "flex h-7 min-w-0 items-center justify-between gap-1.5 rounded-control border border-field bg-card pr-2 pl-2.5 text-label font-normal text-primary",
  "outline-none transition-colors hover:border-strong focus-visible:border-accent focus-visible:shadow-focus",
);

export type PickOption = {
  value: string;
  label: string;
  group?: string;
  custom?: boolean;
  icon?: React.ReactNode;
  hint?: string;
  /** A hairline before it, in a list that is not searched (C32). */
  separatorBefore?: boolean;
};

/**
 * A searchable pick inside a condition card or a window: a compact trigger and a grouped list, which can open on its
 * own (`defaultOpen`) — "Add a condition" opens the field list at once.
 */
export const CompactPick: React.FC<{
  options: PickOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder: string;
  emptyLabel: string;
  ariaLabel: string;
  defaultOpen?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  /** A row pinned under the list, past a hairline ("Pick a date"). */
  pinned?: { label: string; onSelect: () => void } | null;
  triggerLabel?: string | null;
  size?: "sm" | "md";
  /** The options could not be read: "We couldn't load the list" and Try again, in the open list. */
  failed?: { onRetry: () => void } | null;
  invalid?: boolean;
  /**
   * A short list opens without its search row (C32): each option on two lines — its name and its hint — and an option
   * with `separatorBefore` under a hairline.
   */
  searchable?: boolean;
  /** Opened from outside — a condition's operator or value pressed before its field opens the field list (D5). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}> = ({
  options,
  value,
  onChange,
  placeholder,
  emptyLabel,
  ariaLabel,
  defaultOpen = false,
  disabled,
  loading,
  className,
  pinned,
  triggerLabel,
  size = "sm",
  failed,
  invalid,
  searchable = true,
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

  if (searchable) {
    // Hub A18: the field is the search — the shared combobox, with this card's compact field.
    return (
      <Combobox
        options={options.map((o) => ({
          value: o.value,
          label: o.label,
          group: o.group,
          icon: o.icon,
          hint: o.hint,
          trailing: o.custom ? <CustomTag /> : undefined,
        }))}
        value={value}
        onChange={(next) => {
          if (next != null) onChange(next);
        }}
        clearable={false}
        placeholder={placeholder}
        emptyLabel={emptyLabel}
        aria-label={ariaLabel}
        disabled={disabled}
        invalid={invalid}
        size={size}
        className={cn("w-full", className)}
        displayLabel={triggerLabel}
        listState={loading ? <ListLoading /> : failed ? <ListError onRetry={failed.onRetry} /> : undefined}
        footer={pinned}
        defaultOpen={defaultOpen}
        open={openFromOutside}
        onOpenChange={onOpenChange}
      />
    );
  }

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
            "aria-invalid:border-danger",
            // C5: the window's select — 36 high, 0 12 inside, 8 between its parts, a 16 chevron.
            size === "md" && "h-9 gap-2 px-3 text-body",
            "w-full",
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
        <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] min-w-64 rounded-popover p-1">
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
                  <span className="text-body text-primary">{o.label}</span>
                  {o.hint && <span className="text-hint text-tertiary">{o.hint}</span>}
                </button>
              </React.Fragment>
            ))}
          </div>
        </PopoverContent>
    </Popover>
  );
};

/** Several values from a list, inside a condition card: the picked ones named on the trigger. */
export const CompactMultiPick: React.FC<{
  options: { value: string; label: string }[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  emptyLabel: string;
  ariaLabel: string;
  disabled?: boolean;
  loading?: boolean;
}> = ({ options, values, onChange, placeholder, emptyLabel, ariaLabel, disabled, loading }) => {
  // Hub A18: the field is the search.
  return (
    <Combobox
      multiple
      options={options}
      value={values}
      onChange={onChange}
      placeholder={placeholder}
      emptyLabel={emptyLabel}
      aria-label={ariaLabel}
      disabled={disabled}
      size="sm"
      className="min-w-0 flex-1"
      listState={loading ? <ListLoading /> : undefined}
    />
  );
};
