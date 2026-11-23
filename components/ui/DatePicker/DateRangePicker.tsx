"use client";

import { useTranslations } from "next-intl";
import { useRef, useState, type FC } from "react";
import { Calendar04Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { dateToISO, isoToDate, useDateFormatter, useDateParser } from "@/lib/date";
import { Calendar, type CalendarRange } from "@/components/desact/calendar";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/desact/popover";
import { cn } from "@/lib/cn";
import { dateFieldClasses } from "./DatePicker";

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
  invalid?: boolean;
  ariaLabel?: string;
  className?: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** "11 Jan – 22 Jan 2027", "28 Dec 2026 – 8 Jan 2027": the year once when both ends share it. */
export const useRangeLabel = () => {
  const format = useDateFormatter();
  return (range: IsoRange) => {
    const sameYear = range.start.slice(0, 4) === range.end.slice(0, 4);
    return `${format(range.start, { style: "medium", hideYear: sameYear })} – ${format(range.end, { style: "medium" })}`;
  };
};

/**
 * The date field in range mode (AQ-02, `7-product-wide/DATE-RANGE.md`): the same field and the same {@link Calendar},
 * one month, the range drawn by the one rule — accent circles at the ends, the band between them centre to centre.
 * The first click starts a range and the band follows the pointer; the second ends it, earlier or later than the
 * first. **Typing stays**: "11 Jan 2027 – 22 Jan 2027" (either end in any form the date field takes). The range is
 * committed only when both ends are there; a half-picked one is kept inside the popover and dropped when it closes, so
 * the caller never sees a range with one end.
 */
export const DateRangePicker: FC<Props> = ({
  value,
  onChange,
  id,
  disabled = false,
  placeholder,
  maxDays,
  clearable = true,
  invalid = false,
  ariaLabel,
  className,
}) => {
  const t = useTranslations("common");
  const label = useRangeLabel();
  const format = useDateFormatter();
  const parse = useDateParser();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date | null>(null);
  const [typed, setTyped] = useState<string | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const typedRange = (() => {
    if (typed === null) return null;
    const [a, b] = typed.split(/\s+[–—-]\s*|\s*[–—]\s*/);
    const from = a ? parse(a) : null;
    const to = b ? parse(b) : null;
    if (!from) return null;
    return to ? (from <= to ? { from, to } : { from: to, to: from }) : { from };
  })();

  const committed: CalendarRange | undefined = value
    ? { from: isoToDate(value.start), to: isoToDate(value.end) }
    : undefined;
  const shown: CalendarRange | undefined = draft ? { from: draft } : typedRange ?? committed;

  const tooLong = (from: Date, to: Date) =>
    Boolean(maxDays && Math.round((to.getTime() - from.getTime()) / DAY_MS) + 1 > maxDays);

  const commit = (next: IsoRange | null) => {
    setDraft(null);
    setTyped(null);
    onChange(next);
  };

  const settle = () => {
    if (typed === null) return;
    if (typed.trim() === "" && clearable) commit(null);
    else if (typedRange?.to && !tooLong(typedRange.from, typedRange.to))
      commit({ start: dateToISO(typedRange.from), end: dateToISO(typedRange.to) });
    else setTyped(null);
  };

  const pick = (day: Date) => {
    if (!draft) {
      setTyped(null);
      setDraft(day);
      return;
    }
    const [start, end] = day < draft ? [day, draft] : [draft, day];
    commit({ start: dateToISO(start), end: dateToISO(end) });
    setOpen(false);
  };

  // With one end picked, the days too far from it cannot be the other end.
  const isDisabled = maxDays && draft
    ? (day: Date) => Math.abs(Math.round((day.getTime() - draft.getTime()) / DAY_MS)) > maxDays - 1
    : undefined;

  const fieldText = typed ?? (draft ? `${format(draft, { style: "medium" })} – ` : value ? label(value) : "");

  return (
    <Popover
      open={open && !disabled}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setDraft(null);
          settle();
        }
      }}
    >
      <PopoverAnchor asChild>
        <div
          ref={anchorRef}
          onMouseDown={(e) => {
            if (disabled || e.target === inputRef.current) return;
            e.preventDefault();
            inputRef.current?.focus();
            setOpen((o) => !o);
          }}
          className={cn(dateFieldClasses(invalid, className), disabled && "cursor-not-allowed bg-subtle text-disabled")}
        >
          <Icon icon={Calendar04Icon} size="sm" className="shrink-0 text-tertiary" />
          <input
            ref={inputRef}
            id={id}
            type="text"
            autoComplete="off"
            spellCheck={false}
            disabled={disabled}
            aria-label={ariaLabel}
            aria-invalid={invalid || undefined}
            aria-haspopup="dialog"
            value={fieldText}
            placeholder={placeholder ?? t("datePicker.pickRange")}
            onChange={(e) => {
              setDraft(null);
              setTyped(e.target.value);
              if (!open) setOpen(true);
            }}
            onClick={() => !open && setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                settle();
                setOpen(false);
              } else if (e.key === "Escape" && open) {
                e.preventDefault();
                e.stopPropagation();
                setTyped(null);
                setDraft(null);
                setOpen(false);
              } else if (e.key === "ArrowDown" && !open) {
                e.preventDefault();
                setOpen(true);
              } else if (e.key === "Tab") {
                settle();
                setOpen(false);
              }
            }}
            className="h-full min-w-0 flex-1 truncate bg-transparent text-primary outline-none placeholder:text-tertiary disabled:cursor-not-allowed"
          />
          {clearable && value && !disabled && (
            <button
              type="button"
              tabIndex={-1}
              aria-label={t("datePicker.clearRange")}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(event) => {
                event.stopPropagation();
                commit(null);
              }}
              className="shrink-0 rounded-control p-0.5 text-tertiary hover:bg-mist hover:text-secondary"
            >
              <Icon icon={Cancel01Icon} size="sm" />
            </button>
          )}
        </div>
      </PopoverAnchor>

      <PopoverContent
        className="w-auto p-0"
        align="start"
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          if (e.target instanceof Node && anchorRef.current?.contains(e.target)) e.preventDefault();
        }}
      >
        <Calendar
          mode="range"
          selected={shown}
          defaultMonth={shown?.from}
          onSelect={pick}
          isDisabled={isDisabled}
          onToday={() => {
            // A range has no "today" to pick: Today shows this month, and starts the range on today.
            pick(new Date());
          }}
          onClear={clearable ? () => {
            commit(null);
            setOpen(false);
          } : undefined}
        />
      </PopoverContent>
    </Popover>
  );
};
