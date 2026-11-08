"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Add01Icon, Cancel01Icon, Tick02Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/desact/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/desact/command";
import { Illustration } from "@/components/illustrations";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { cn } from "@/lib/cn";
import { CustomTag, ListError, ListLoading } from "../parts/parts";

/*
 * The look of every condition in automations (PRODUCT-RULES § Controls, `automations-editor` § Values): an outlined
 * group, radius 10; each condition a Mist card, radius 10, 8 inside, on two lines — the field and its remove, then
 * the operator and the value, 28 high and white; the joiner centred between hairlines; a nested group dashed.
 */

export const ConditionGroup: React.FC<{ children: React.ReactNode; nested?: boolean; className?: string }> = ({
  children,
  nested = false,
  className,
}) => (
  <div
    role="group"
    className={cn(
      "flex flex-col gap-2 rounded-popover border p-3",
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
  <div className="flex flex-col gap-1.5 rounded-popover bg-mist p-2">
    <div className="flex items-center gap-1.5">
      <div className="min-w-0 flex-1">{first}</div>
      {onRemove && (
        <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove} aria-label={removeLabel} className="text-tertiary">
          <Icon icon={Cancel01Icon} size="sm" />
        </Button>
      )}
    </div>
    <div className="flex min-w-0 flex-wrap items-center gap-1.5">{second}</div>
  </div>
);

export type Joiner = "AND" | "OR";

/** "And / Or", centred with a hairline each side. Without `onChange` it is the word alone. */
export const ConditionJoiner: React.FC<{ value: Joiner; onChange?: (value: Joiner) => void }> = ({ value, onChange }) => {
  const t = useTranslations("automationsSettings");
  return (
    <div className="flex items-center gap-2">
      <span className="h-px flex-1 bg-divider" />
      {onChange ? (
        <SegmentedControl<Joiner>
          aria-label={t("conditions.joiner")}
          fill={false}
          className="h-7"
          value={value}
          onChange={onChange}
          options={[
            { value: "AND", label: t("conditions.and") },
            { value: "OR", label: t("conditions.or") },
          ]}
        />
      ) : (
        <span className="text-hint text-tertiary">{value === "AND" ? t("conditions.andLower") : t("conditions.orLower")}</span>
      )}
      <span className="h-px flex-1 bg-divider" />
    </div>
  );
};

export const AddConditionButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <Button type="button" variant="ghost" size="sm" onClick={onClick} className="w-fit gap-1.5 px-2 text-secondary">
    <Icon icon={Add01Icon} size="sm" />
    {children}
  </Button>
);

/** The small white control inside a condition card: 28 high, radius 8. */
export const compactTrigger = cn(
  "flex h-7 min-w-0 items-center justify-between gap-1.5 rounded-control border border-field bg-card px-2 text-label font-normal text-primary",
  "outline-none transition-colors hover:border-strong focus-visible:border-accent focus-visible:shadow-focus",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

export type PickOption = {
  value: string;
  label: string;
  group?: string;
  custom?: boolean;
  icon?: React.ReactNode;
  hint?: string;
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
}) => {
  const tCommon = useTranslations("common");
  const [open, setOpen] = React.useState(defaultOpen);
  const picked = options.find((o) => o.value === value) ?? null;
  const groups = React.useMemo(() => {
    const map = new Map<string, PickOption[]>();
    for (const o of options) map.set(o.group ?? "", [...(map.get(o.group ?? "") ?? []), o]);
    return [...map.entries()];
  }, [options]);
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
            "aria-invalid:border-danger",
            size === "md" && "h-9 px-3 text-body",
            "w-full",
            className,
          )}
        >
          <span className="flex min-w-0 items-center gap-1.5">
            {picked?.icon}
            <span className={cn("truncate", !shown && "text-tertiary")}>{shown ?? placeholder}</span>
          </span>
          <Icon icon={ArrowDown01Icon} size="sm" className="shrink-0 text-tertiary" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] min-w-64 p-0">
        <Command>
          <CommandInput placeholder={tCommon("actions.search")} />
          <CommandList className="max-h-80">
            {loading ? (
              <ListLoading />
            ) : failed ? (
              <ListError onRetry={failed.onRetry} />
            ) : (
              <>
                <CommandEmpty>
                  <div className="flex flex-col items-center gap-2">
                    <Illustration scene="no-results-s" size="s" />
                    {emptyLabel}
                  </div>
                </CommandEmpty>
                {groups.map(([group, items]) => (
                  <CommandGroup key={group || "_"} heading={group || undefined}>
                    {items.map((o) => (
                      <CommandItem
                        key={o.value}
                        value={`${o.label} ${o.value}`}
                        onSelect={() => {
                          onChange(o.value);
                          setOpen(false);
                        }}
                      >
                        {o.icon}
                        <span className="truncate">{o.label}</span>
                        {o.hint && <span className="shrink-0 text-hint text-tertiary">{o.hint}</span>}
                        {o.custom && <CustomTag />}
                        <Icon icon={Tick02Icon} size="sm" className={cn("ml-auto", o.value === value ? "opacity-100" : "opacity-0")} />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </>
            )}
          </CommandList>
          {pinned && (
            <div className="border-t border-divider p-1">
              <button
                type="button"
                onClick={() => {
                  pinned.onSelect();
                  setOpen(false);
                }}
                className="flex min-h-8 w-full items-center rounded-control px-2 py-1.5 text-left text-body hover:bg-accent-subtle focus-visible:bg-accent-subtle focus-visible:outline-none"
              >
                {pinned.label}
              </button>
            </div>
          )}
        </Command>
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
  const tCommon = useTranslations("common");
  const [open, setOpen] = React.useState(false);
  const picked = options.filter((o) => values.includes(o.value)).map((o) => o.label);
  const toggle = (v: string) => onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <button type="button" role="combobox" aria-expanded={open} aria-label={ariaLabel} disabled={disabled} className={cn(compactTrigger, "min-w-28 flex-1")}>
          <span className={cn("truncate", picked.length === 0 && "text-tertiary")}>
            {picked.length ? picked.join(", ") : placeholder}
          </span>
          <Icon icon={ArrowDown01Icon} size="sm" className="shrink-0 text-tertiary" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <Command>
          <CommandInput placeholder={tCommon("actions.search")} />
          <CommandList className="max-h-80">
            {loading ? (
              <ListLoading />
            ) : (
              <>
                <CommandEmpty>{emptyLabel}</CommandEmpty>
                <CommandGroup>
                  {options.map((o) => (
                    <CommandItem key={o.value} value={`${o.label} ${o.value}`} onSelect={() => toggle(o.value)}>
                      <span className="truncate">{o.label}</span>
                      <Icon icon={Tick02Icon} size="sm" className={cn("ml-auto", values.includes(o.value) ? "opacity-100" : "opacity-0")} />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
