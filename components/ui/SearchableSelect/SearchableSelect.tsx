"use client";

import * as React from "react";
import { Tick02Icon, UnfoldMoreIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Button } from "@/components/desact/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/desact/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/desact/popover";
import { cn } from "@/lib/cn";

export type SearchableOption = {
  value: string;
  label: string;
  /** Extra words the search should match — a country code, an alias. Never shown. */
  keywords?: string;
  /** Drawn before the label: a flag, an icon. */
  icon?: React.ReactNode;
  /** A quiet note after the label, for what the choice implies. */
  hint?: string;
  /** The heading the option sits under — job levels under their level group. Groups keep first-seen order. */
  group?: string;
  /** Indent steps, for a tree read as a list — a department under its parent. */
  depth?: number;
  /** Shown but not choosable; the hint says why. */
  disabled?: boolean;
};

/** Options in their groups, each group in the order it first appears; ungrouped options first. */
const groupOptions = (options: SearchableOption[]) => {
  const groups = new Map<string, SearchableOption[]>();
  for (const option of options) {
    const key = option.group ?? "";
    groups.set(key, [...(groups.get(key) ?? []), option]);
  }
  return [...groups.entries()];
};

/**
 * The list's scrollbar: a thumb with no arrows, visible only while the list is moving — the look of
 * Desact's ScrollArea, kept on the list cmdk already scrolls so keyboard navigation still follows.
 * Chromium and Safari draw it from the `::-webkit-scrollbar` parts; Firefox ignores them and keeps
 * its own thin overlay bar, which already behaves this way.
 *
 * <p>A scrollbar part ignores CSS transitions, so the fade is driven from script: the thumb's colour
 * is the border colour at `--thumb-alpha`, and that variable is stepped down frame by frame.
 */
const AUTOHIDE_SCROLLBAR = cn(
  "[&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-track]:bg-transparent",
  "[&::-webkit-scrollbar-thumb]:rounded-pill [&::-webkit-scrollbar-thumb]:border-2",
  "[&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent",
  "[&::-webkit-scrollbar-thumb]:bg-clip-padding",
  "[&::-webkit-scrollbar-thumb]:bg-[color-mix(in_srgb,var(--border-strong)_calc(var(--thumb-alpha,0)*100%),transparent)]",
);

const SCROLLBAR_LINGER_MS = 600;
const SCROLLBAR_FADE_MS = 500;

/** Shows the thumb while the list moves; once it has been still for a moment, fades it out. */
const showScrollbarWhileScrolling = (event: React.UIEvent<HTMLElement>) => {
  const list = event.currentTarget;
  window.clearTimeout(Number(list.dataset.scrollTimer));
  window.cancelAnimationFrame(Number(list.dataset.fadeFrame));
  list.style.setProperty("--thumb-alpha", "1");
  list.dataset.scrollTimer = String(
    window.setTimeout(() => {
      const start = performance.now();
      const step = (now: number) => {
        const progress = Math.min((now - start) / SCROLLBAR_FADE_MS, 1);
        // Ease-out: quick at first, settling gently into nothing.
        list.style.setProperty("--thumb-alpha", String((1 - progress) ** 2));
        if (progress < 1) list.dataset.fadeFrame = String(window.requestAnimationFrame(step));
      };
      list.dataset.fadeFrame = String(window.requestAnimationFrame(step));
    }, SCROLLBAR_LINGER_MS),
  );
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
  "aria-label"?: string;
  "aria-invalid"?: boolean;
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
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
}) => {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.value === value) ?? null;

  return (
    // Modal: the list is portalled out of any dialog it opens from, and a dialog's scroll lock swallowed
    // the mouse wheel on it — a list of fifty departments could not be scrolled (walk of 2026-11-01). A
    // modal popover carries its own lock, which lets the list itself scroll.
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="secondary"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          aria-invalid={ariaInvalid}
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
              <span className="text-tertiary">{placeholder}</span>
            )}
          </span>
          <Icon icon={UnfoldMoreIcon} size="sm" className="ml-2 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      {/* At least as wide as a readable option: a filter's value trigger is narrow, and a list as narrow
          as it cut "Standard Sick Leave" short (walk of 2026-11-01). */}
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] min-w-64 p-0">
        <Command>
          <CommandInput placeholder="Search" />
          <CommandList onScroll={showScrollbarWhileScrolling} className={AUTOHIDE_SCROLLBAR}>
            <CommandEmpty>{emptyLabel}</CommandEmpty>
            {groupOptions(options).map(([group, items]) => (
              <CommandGroup key={group} heading={group || undefined}>
                {items.map((option) => (
                  <CommandItem
                    key={option.value}
                    // The value is in cmdk's key too: two departments may share a name, and cmdk tells
                    // its items apart by this string.
                    value={`${option.label} ${option.keywords ?? ""} ${option.value}`}
                    disabled={option.disabled}
                    style={option.depth ? { paddingLeft: `${0.5 + option.depth * 0.75}rem` } : undefined}
                    onSelect={() => {
                      onChange(clearable && option.value === value ? null : option.value);
                      setOpen(false);
                    }}
                  >
                    {option.icon}
                    <span className="truncate">{option.label}</span>
                    {option.hint && (
                      <span className="ml-2 shrink-0 text-hint text-tertiary">{option.hint}</span>
                    )}
                    <Icon icon={Tick02Icon} className={cn("ml-auto h-4 w-4", option.value === value ? "opacity-100" : "opacity-0")} />
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
