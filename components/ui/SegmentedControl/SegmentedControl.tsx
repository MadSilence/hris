"use client";

import * as React from "react";

import { cn } from "@/lib/cn";

export type SegmentedOption<T extends string> = {
  value: T;
  label: React.ReactNode;
  disabled?: boolean;
};

type Props<T extends string> = {
  options: SegmentedOption<T>[];
  /** Null while nothing is picked — every segment then looks unpicked, and Tab lands on the first. */
  value: T | null;
  onChange: (value: T) => void;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  disabled?: boolean;
  /** Stretch to the parent's width, each segment an equal share (the default), or hug the labels. */
  fill?: boolean;
  /**
   * `sm` — Home's small switch (the designers' Home fixes H10, E7, E11b): a pill 28 high, segments 24 high, 12/20,
   * the picked one 500 and the others 400. `window` — a switch inside an automations settings window (the designers'
   * fixes C9): the same 32-high track, segments radius 6 at 13/20 500, the picked one under a lighter shadow. The
   * default stays the 32-high control every other screen uses.
   */
  size?: "md" | "sm" | "window";
  /**
   * The small switch's track: Mist with a soft shadow under the picked segment (the default); `divider` on a white
   * page, no shadow; `band` on the accent band — white 16 %, the unpicked words white, no shadow (E7).
   */
  tone?: "mist" | "divider" | "band";
  className?: string;
};

/**
 * Two to five options side by side (`design/QUESTIONS.md` Q-1, built from the automations frames until the designers
 * add it to the package): 32 high, radius 8, a Mist track, the picked segment white at level 1. PRODUCT-RULES
 * § Controls — two or three options are a segmented control, not a dropdown.
 *
 * <p>A radio group to a screen reader and to the keyboard: one tab stop (the picked segment), the arrow keys move the
 * pick and wrap, Home and End go to the ends, and a disabled segment is skipped.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  disabled = false,
  fill = true,
  size = "md",
  tone = "mist",
  className,
}: Props<T>) {
  const small = size === "sm";
  const inWindow = size === "window";
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const enabled = options.map((o, i) => (!disabled && !o.disabled ? i : -1)).filter((i) => i >= 0);
  const pickedIndex = options.findIndex((o) => o.value === value);
  const tabStop = pickedIndex >= 0 && enabled.includes(pickedIndex) ? pickedIndex : enabled[0] ?? -1;

  const pickAt = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    refs.current[index]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (enabled.length === 0) return;
    const at = enabled.indexOf(index);
    let next: number | null = null;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = enabled[(at + 1) % enabled.length];
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = enabled[(at - 1 + enabled.length) % enabled.length];
        break;
      case "Home":
        next = enabled[0];
        break;
      case "End":
        next = enabled[enabled.length - 1];
        break;
      default:
        return;
    }
    event.preventDefault();
    pickAt(next);
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-disabled={disabled || undefined}
      className={cn(
        "inline-flex items-stretch gap-0.5 p-0.5",
        small ? "h-7 rounded-pill" : "h-8 rounded-control",
        !small || tone === "mist" ? "bg-mist" : tone === "divider" ? "bg-divider" : "band-track",
        fill && "flex w-full",
        className,
      )}
    >
      {options.map((option, index) => {
        const picked = option.value === value;
        const off = disabled || option.disabled;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={picked}
            disabled={off}
            tabIndex={index === tabStop ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              "inline-flex min-w-0 items-center justify-center truncate",
              small ? "rounded-pill px-2.5 text-hint leading-5" : inWindow ? "rounded-tag px-3 text-label leading-5" : "rounded-control px-3 text-label",
              "transition-[background-color,color,box-shadow] duration-(--duration-hover)",
              "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent",
              fill && "flex-1",
              !small && (picked ? cn("bg-card text-primary", inWindow ? "shadow-segment" : "shadow-raised") : "text-secondary hover:text-primary"),
              small &&
                (picked
                  ? cn("bg-card font-medium text-primary", tone === "mist" && "shadow-card")
                  : cn("font-normal", tone === "band" ? "on-band hover:opacity-90" : "text-secondary hover:text-primary")),
              off && "cursor-not-allowed text-disabled hover:text-disabled",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
