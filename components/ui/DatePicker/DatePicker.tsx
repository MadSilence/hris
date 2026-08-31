"use client";

import { dateToISO, isoToDate } from "@/lib/date";

import { useState, type FC } from "react";
import { format } from "date-fns";
import type { Matcher } from "react-day-picker";
import { CalendarDays, X } from "lucide-react";

import { Calendar } from "@/public/desact/src/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/public/desact/src/components/ui/popover";
import { cn } from "@/public/desact/src/components/ui/utils";

export { dateToISO, isoToDate } from "@/lib/date";

const isValidISO = (iso: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(iso) && !Number.isNaN(isoToDate(iso).getTime());

type Props = {
  /** `yyyy-MM-dd`, or "" for no date — the same string an `<input type="date">` carried. */
  value: string;
  /** Called with a new ISO string, or "" when the date is cleared. */
  onChange: (value: string) => void;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
  /** Inclusive ISO bounds; days outside them cannot be picked. */
  min?: string;
  max?: string;
  /** Set false where the field is required and an empty value makes no sense. */
  clearable?: boolean;
  invalid?: boolean;
  ariaLabel?: string;
  className?: string;
};

/**
 * The app's single date field: a Desact `Calendar` in a popover, triggered by a button dressed as an
 * input.
 *
 * Replaces `<input type="date">`, whose look, keyboard behaviour and locale ordering are the
 * browser's rather than ours — Chrome, Firefox and Safari each drew a different control. The value
 * stays an ISO string so callers, forms and the API keep the shape they already had.
 */
export const DatePicker: FC<Props> = ({
  value,
  onChange,
  id,
  disabled = false,
  placeholder = "Pick a date",
  min,
  max,
  clearable = true,
  invalid = false,
  ariaLabel,
  className,
}) => {
  const [open, setOpen] = useState(false);

  const selected = value && isValidISO(value) ? isoToDate(value) : undefined;

  const bounds: Matcher[] = [];
  if (min && isValidISO(min)) bounds.push({ before: isoToDate(min) });
  if (max && isValidISO(max)) bounds.push({ after: isoToDate(max) });

  const handleSelect = (date: Date | undefined) => {
    onChange(date ? dateToISO(date) : "");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          // `data-invalid`, not `aria-invalid`: the trigger is a button, and aria-invalid is only
          // meaningful on an actual form field. The message next to it is what tells a reader.
          data-invalid={invalid || undefined}
          aria-label={ariaLabel}
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-lg border border-brown-300 bg-input-background px-3 text-sm outline-none transition-colors",
            "hover:border-brown-400 disabled:cursor-not-allowed disabled:opacity-50",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "data-[invalid]:border-destructive data-[invalid]:ring-destructive/20",
            className,
          )}
        >
          <CalendarDays className="size-4 shrink-0 text-brown-400" aria-hidden />

          <span className={cn("min-w-0 flex-1 truncate text-left", !selected && "text-muted-foreground")}>
            {selected ? format(selected, "MMM d, yyyy") : placeholder}
          </span>

          {clearable && selected && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Clear date"
              onClick={(event) => {
                event.stopPropagation();
                onChange("");
              }}
              className="shrink-0 rounded p-0.5 text-brown-400 hover:bg-brown-100 hover:text-brown-700"
            >
              <X className="size-3.5" />
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          defaultMonth={selected ?? undefined}
          disabled={bounds.length > 0 ? bounds : undefined}
        />
      </PopoverContent>
    </Popover>
  );
};
