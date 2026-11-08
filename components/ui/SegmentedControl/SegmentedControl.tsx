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
  className,
}: Props<T>) {
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
      className={cn("inline-flex h-8 items-stretch gap-0.5 rounded-control bg-mist p-0.5", fill && "flex w-full", className)}
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
              "inline-flex min-w-0 items-center justify-center truncate rounded-control px-3 text-label",
              "transition-[background-color,color,box-shadow] duration-(--duration-hover)",
              "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent",
              fill && "flex-1",
              picked ? "bg-card text-primary shadow-raised" : "text-secondary hover:text-primary",
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
