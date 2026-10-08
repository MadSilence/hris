"use client";

import { useState, type FC } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { CalendarRange, X } from "lucide-react";

import { dateToISO, isoToDate } from "@/lib/date";
import { Calendar } from "@/public/desact/src/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/public/desact/src/components/ui/popover";
import { cn } from "@/public/desact/src/components/ui/utils";

export type IsoRange = { start: string; end: string };

type Props = {
  /** Both ends `yyyy-MM-dd`, inclusive — or `null` for no range. */
  value: IsoRange | null;
  /** Called once both ends are picked, or with `null` when the range is cleared. */
  onChange: (value: IsoRange | null) => void;
  id?: string;
  disabled?: boolean;
  /** Shown while there is no range. */
  placeholder?: string;
  /** The longest range that may be picked, in days, both ends counted. */
  maxDays?: number;
  clearable?: boolean;
  ariaLabel?: string;
  className?: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The app's range field — `DatePicker`'s twin for two dates: the same trigger dressed as an input, a
 * Desact `Calendar` in range mode in the popover. The range is committed only when both ends are
 * picked; a half-picked one is kept inside the popover and dropped when it closes, so the caller never
 * sees a range with one end.
 *
 * `RequestTimeOffModal` still draws its own range by hand; it is this component's second user when it
 * moves (`analysis/ui/FORMS_AND_FIELDS.md` § 1 predicted exactly this).
 */
export const DateRangePicker: FC<Props> = ({
  value,
  onChange,
  id,
  disabled = false,
  placeholder = "Pick a range",
  maxDays,
  clearable = true,
  ariaLabel,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>(undefined);

  const committed: DateRange | undefined = value
    ? { from: isoToDate(value.start), to: isoToDate(value.end) }
    : undefined;
  const shown = draft ?? committed;

  // Two clicks, always: the first starts a range, the second ends it — earlier or later than the first.
  // The calendar's own range logic would stretch the committed range on a single click instead, and a
  // reader re-picking a period expects to start over.
  const handleSelect = (_range: DateRange | undefined, day: Date) => {
    if (!draft?.from) {
      setDraft({ from: day, to: undefined });
      return;
    }
    const [start, end] = day < draft.from ? [day, draft.from] : [draft.from, day];
    setDraft(undefined);
    onChange({ start: dateToISO(start), end: dateToISO(end) });
    setOpen(false);
  };

  // With one end picked, the days too far from it cannot be the other end.
  const tooFar = maxDays && draft?.from && !draft.to
    ? [
      { before: new Date(draft.from.getTime() - (maxDays - 1) * DAY_MS) },
      { after: new Date(draft.from.getTime() + (maxDays - 1) * DAY_MS) },
    ]
    : undefined;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setDraft(undefined);
      }}
    >
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-lg border border-brown-300 bg-input-background px-3 text-sm outline-none transition-colors",
            "hover:border-brown-400 disabled:cursor-not-allowed disabled:opacity-50",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            className,
          )}
        >
          <CalendarRange className="size-4 shrink-0 text-brown-400" aria-hidden />

          <span className={cn("min-w-0 flex-1 truncate text-left", !value && "text-muted-foreground")}>
            {value
              ? `${format(isoToDate(value.start), "MMM d, yyyy")} – ${format(isoToDate(value.end), "MMM d, yyyy")}`
              : placeholder}
          </span>

          {clearable && value && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Clear range"
              onClick={(event) => {
                event.stopPropagation();
                onChange(null);
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
          mode="range"
          selected={shown}
          onSelect={handleSelect}
          defaultMonth={shown?.from ?? undefined}
          numberOfMonths={2}
          disabled={tooFar}
        />
      </PopoverContent>
    </Popover>
  );
};
