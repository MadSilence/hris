"use client";

import * as React from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/cn";
import { buttonVariants } from "./button";
import { Icon } from "./icon";

/*
 * The month grid behind every date field. Today is the date in an accent ring (SPEC § 13.13 "Today"); a picked single
 * day is the accent fill.
 *
 * **A picked range is one soft band** (the owner and the designers, 2026-11-05 — `DESIGN_SYSTEM.md` § 7): the accent's
 * subtle tint the cell's full width, 4 px in at top and bottom, radius 8 at its ends and at a week's edges, so the days
 * of a week run as one ribbon; the first and last day a 28 px `accent-muted` circle with accent text; today stays the
 * filled accent circle, also when it is an end. **While only the first date is picked**, a Mist band runs to the day
 * under the pointer (or the keyboard's focus), that day in the soft circle; it takes the accent on the second click.
 * Figures are tabular.
 */
function Calendar({ className, classNames, showOutsideDays = true, ...props }: React.ComponentProps<typeof DayPicker>) {
  const isRange = props.mode === "range";
  const selectedRange = isRange ? (props.selected as DateRange | undefined) : undefined;
  // A one-day range reads as "the second date still to come" too: forms that keep the end equal to the start after
  // the first click (the request dialog does, so a single day is a valid request) would otherwise never show the
  // preview — and the next click extends it either way (walk of 2026-11-05).
  const choosing = Boolean(
    selectedRange?.from && (!selectedRange.to || selectedRange.to.getTime() === selectedRange.from.getTime()),
  );
  const [pointer, setPointer] = React.useState<Date | null>(null);

  // The preview: from the first date to where the pointer is, in either direction.
  const preview = React.useMemo(() => {
    if (!choosing || !pointer || !selectedRange?.from) return undefined;
    const a = selectedRange.from;
    return a <= pointer ? { from: a, to: pointer } : { from: pointer, to: a };
  }, [choosing, pointer, selectedRange?.from]);

  return (
    <DayPicker
      {...props}
      showOutsideDays={showOutsideDays}
      className={cn("p-3 tabular-nums", className)}
      modifiers={{
        ...(props.modifiers ?? {}),
        ...(preview ? { preview, previewEnd: pointer ?? undefined, previewFrom: preview.from, previewTo: preview.to } : {}),
      }}
      modifiersClassNames={{ ...(props.modifiersClassNames ?? {}), preview: "day-preview", previewEnd: "day-preview-end",
        previewFrom: "day-preview-from",
        previewTo: "day-preview-to",
      }}
      onDayMouseEnter={(day, ...rest) => {
        if (isRange) setPointer(day);
        props.onDayMouseEnter?.(day, ...rest);
      }}
      onDayFocus={(day, ...rest) => {
        if (isRange) setPointer(day);
        props.onDayFocus?.(day, ...rest);
      }}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-body font-medium text-primary",
        nav: "flex items-center gap-1",
        nav_button: cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "text-tertiary"),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell: "w-8 text-hint font-medium text-tertiary",
        row: "flex w-full mt-1",
        cell: cn(
          "relative p-0 text-center text-body focus-within:relative focus-within:z-20",
          isRange
            ? cn(
                // The picked range: the accent's subtle band, the cell's full width, 4 px in at top and bottom.
                "[&:has([aria-selected])]:before:absolute [&:has([aria-selected])]:before:inset-x-0",
                "[&:has([aria-selected])]:before:inset-y-1 [&:has([aria-selected])]:before:content-['']",
                "[&:has([aria-selected])]:before:bg-accent-subtle",
                // The preview while the second date is still to come: the same band in Mist.
                "[&:has(.day-preview)]:before:absolute [&:has(.day-preview)]:before:inset-x-0",
                "[&:has(.day-preview)]:before:inset-y-1 [&:has(.day-preview)]:before:content-['']",
                // Mist wins over the first date's own tint while the preview runs, so the band is one colour.
                "[&:has(.day-preview)]:before:!bg-mist",
                // Rounded at the run's ends and at a week's edges, so each week is one ribbon.
                "[&:has(>.day-range-start)]:before:rounded-l-control [&:has(>.day-range-end)]:before:rounded-r-control",
                "first:before:rounded-l-control last:before:rounded-r-control",
                // The preview's ends, whichever way the pointer went.
                "[&:has(>.day-preview-from)]:before:rounded-l-control [&:has(>.day-preview-to)]:before:rounded-r-control",
              )
            : "[&:has([aria-selected])]:rounded-control",
        ),
        day: cn(
          "relative z-10 inline-flex size-8 items-center justify-center rounded-control text-body text-primary",
          "transition-colors duration-(--duration-hover) hover:bg-mist aria-selected:hover:bg-transparent",
          "focus-visible:outline-offset-[-2px]",
          isRange && "[&.day-preview-end]:size-7 [&.day-preview-end]:rounded-pill [&.day-preview-end]:bg-accent-muted [&.day-preview-end]:font-semibold [&.day-preview-end]:text-accent-text",
        ),
        day_range_start:
          "day-range-start aria-selected:size-7 aria-selected:rounded-pill aria-selected:bg-accent-muted aria-selected:font-semibold aria-selected:text-accent-text",
        day_range_end:
          "day-range-end aria-selected:size-7 aria-selected:rounded-pill aria-selected:bg-accent-muted aria-selected:font-semibold aria-selected:text-accent-text",
        day_selected: isRange
          ? "text-primary"
          : "bg-accent text-on-accent hover:bg-accent-hover hover:text-on-accent focus:bg-accent focus:text-on-accent",
        // Today keeps its filled accent circle inside a range — even as its first or last day.
        day_today: cn(
          "font-semibold text-accent-text ring-[1.5px] ring-accent ring-inset rounded-pill",
          isRange && "aria-selected:!size-7 aria-selected:!bg-accent aria-selected:!text-on-accent aria-selected:ring-0",
        ),
        day_outside: "day-outside text-disabled aria-selected:text-tertiary",
        day_disabled: "text-disabled hover:bg-transparent",
        day_range_middle: "aria-selected:bg-transparent aria-selected:text-primary rounded-none",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className }) => <Icon icon={ArrowLeft01Icon} size="sm" className={className} />,
        IconRight: ({ className }) => <Icon icon={ArrowRight01Icon} size="sm" className={className} />,
      }}
    />
  );
}

export { Calendar };
