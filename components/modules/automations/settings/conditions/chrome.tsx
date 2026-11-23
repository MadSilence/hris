"use client";

import * as React from "react";
import { Combobox } from "@/components/ui/Combobox";
import { cn } from "@/lib/cn";
import { CompactSelect } from "@/components/audience/ConditionChrome";
import { CustomTag, ListError, ListLoading } from "../parts/parts";

/*
 * The automations' own picks inside a condition card or a window. The look they sit in — the condition card, "and",
 * "Add a condition", the 28-high trigger — is the product's filter and lives in `components/audience/ConditionChrome`
 * (moved there 2026-11-20); these two stay here because their lists carry the automations' own states (a Custom tag,
 * "We couldn't load the list").
 */

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
    <CompactSelect
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      ariaLabel={ariaLabel}
      disabled={disabled}
      invalid={invalid}
      size={size}
      className={className}
      listClassName="min-w-64"
      triggerLabel={triggerLabel}
      open={open}
      onOpenChange={setOpen}
    />
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
