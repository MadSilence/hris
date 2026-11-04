"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/cn";
import { buttonVariants } from "./button";
import { Icon } from "./icon";

/*
 * The month grid behind every date field. Today is the date in an accent ring (SPEC § 13.13 "Today"); a picked
 * day is the accent fill; the days inside a range take the accent's muted tint. Figures are tabular.
 */
function Calendar({ className, classNames, showOutsideDays = true, ...props }: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 tabular-nums", className)}
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
          "[&:has([aria-selected])]:bg-accent-muted",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-control [&:has(>.day-range-start)]:rounded-l-control first:[&:has([aria-selected])]:rounded-l-control last:[&:has([aria-selected])]:rounded-r-control"
            : "[&:has([aria-selected])]:rounded-control",
        ),
        day: cn(
          "inline-flex size-8 items-center justify-center rounded-control text-body text-primary",
          "transition-colors duration-(--duration-hover) hover:bg-mist aria-selected:hover:bg-transparent",
          "focus-visible:outline-offset-[-2px]",
        ),
        day_range_start: "day-range-start aria-selected:bg-accent aria-selected:text-on-accent",
        day_range_end: "day-range-end aria-selected:bg-accent aria-selected:text-on-accent",
        day_selected:
          "bg-accent text-on-accent hover:bg-accent-hover hover:text-on-accent focus:bg-accent focus:text-on-accent",
        day_today: "font-semibold text-accent-text ring-[1.5px] ring-accent ring-inset rounded-pill",
        day_outside: "day-outside text-disabled aria-selected:text-tertiary",
        day_disabled: "text-disabled hover:bg-transparent",
        day_range_middle: "aria-selected:bg-accent-muted aria-selected:text-primary rounded-none",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className }) => <Icon icon={ArrowLeft01Icon} size="sm" className={className} />,
        IconRight: ({ className }) => <Icon icon={ArrowRight01Icon} size="sm" className={className} />,
      }}
      {...props}
    />
  );
}

export { Calendar };
