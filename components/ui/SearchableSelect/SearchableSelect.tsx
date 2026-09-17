"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/public/desact/src/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/public/desact/src/components/ui/popover";
import { cn } from "@/public/desact/src/components/ui/utils";

export type SearchableOption = {
  value: string;
  label: string;
  /** Extra words the search should match — a country code, an alias. Never shown. */
  keywords?: string;
  /** Drawn before the label: a flag, an icon. */
  icon?: React.ReactNode;
  /** A quiet note after the label, for what the choice implies. */
  hint?: string;
};

/**
 * A select for a list nobody can scan.
 *
 * <p>The rule of thumb this exists for: past a screenful, a `Select` is a scrollbar and a guess.
 * Two hundred and forty countries and four hundred time zones are both well past it, and the one
 * thing everybody knows about their own country or city is how it is spelled.
 *
 * <p>Deliberately not a replacement for `Select`. A list of four employment types is better as a
 * plain select — a search box in front of four options is furniture. Reach for this when the list is
 * long enough that the reader would otherwise scroll looking for something they can already name.
 */
export const SearchableSelect: React.FC<{
  options: SearchableOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  /** Shown on the trigger while nothing is chosen. A select's one allowed placeholder. */
  placeholder?: string;
  /** Sentence for the empty result. */
  emptyLabel?: string;
  /** Clicking the chosen option again clears it. Off where the field must hold a value. */
  clearable?: boolean;
  id?: string;
  disabled?: boolean;
  className?: string;
}> = ({
  options,
  value,
  onChange,
  placeholder = "Select",
  emptyLabel = "Nothing matches that.",
  clearable = true,
  id,
  disabled,
  className,
}) => {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between font-normal", className)}
        >
          <span className="flex min-w-0 items-center gap-2">
            {selected ? (
              <>
                {selected.icon}
                <span className="truncate">{selected.label}</span>
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Search" />
          <CommandList>
            <CommandEmpty>{emptyLabel}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.keywords ?? ""}`}
                  onSelect={() => {
                    onChange(clearable && option.value === value ? null : option.value);
                    setOpen(false);
                  }}
                >
                  {option.icon}
                  <span className="truncate">{option.label}</span>
                  {option.hint && (
                    <span className="ml-2 shrink-0 text-xs text-muted-foreground">{option.hint}</span>
                  )}
                  <Check
                    className={cn("ml-auto h-4 w-4", option.value === value ? "opacity-100" : "opacity-0")}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
