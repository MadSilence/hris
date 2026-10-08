"use client";

import { useState, type FC } from "react";
import { Clock } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/public/desact/src/components/ui/popover";
import { cn } from "@/public/desact/src/components/ui/utils";

const HOURS = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, step) => String(step * 5).padStart(2, "0"));

type Props = {
  /** `HH:mm`, or "" for no time — the same string an `<input type="time">` carried. */
  value: string;
  onChange: (value: string) => void;
  id?: string;
  disabled?: boolean;
  /** Shown muted while the field is empty. May itself be a time, as a suggestion. */
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
};

/**
 * The app's time field, drawn like `DatePicker`: a button dressed as an input, and a popover with an
 * hour column and a minute column in five-minute steps.
 *
 * Replaces `<input type="time">` for the same reason `DatePicker` replaced the date input — each
 * browser draws that control its own way. The value stays an `HH:mm` string.
 */
export const TimePicker: FC<Props> = ({
  value,
  onChange,
  id,
  disabled = false,
  placeholder = "--:--",
  ariaLabel,
  className,
}) => {
  const [open, setOpen] = useState(false);

  const [hour, minute] = /^\d{2}:\d{2}$/.test(value) ? value.split(":") : ["", ""];

  // Picking one half before the other fills the missing half with a sensible default, so the
  // field is never left holding half a time.
  const pickHour = (next: string) => onChange(`${next}:${minute || "00"}`);
  const pickMinute = (next: string) => {
    onChange(`${hour || "09"}:${next}`);
    setOpen(false);
  };

  const cell = (selected: boolean) =>
    cn(
      "w-full rounded-md px-3 py-1.5 text-center text-sm tabular-nums transition-colors",
      selected ? "bg-brown-700 text-white" : "text-foreground hover:bg-brown-100",
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
          <Clock className="size-4 shrink-0 text-brown-400" aria-hidden />
          <span className={cn("min-w-0 flex-1 truncate text-left tabular-nums", !value && "text-muted-foreground")}>
            {value || placeholder}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-2" align="start">
        <div className="flex gap-2">
          <div className="flex max-h-56 w-16 flex-col gap-0.5 overflow-y-auto" role="listbox" aria-label="Hour">
            {HOURS.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={option === hour}
                className={cell(option === hour)}
                onClick={() => pickHour(option)}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="w-px bg-brown-100" aria-hidden />
          <div className="flex max-h-56 w-16 flex-col gap-0.5 overflow-y-auto" role="listbox" aria-label="Minute">
            {MINUTES.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={option === minute}
                className={cell(option === minute)}
                onClick={() => pickMinute(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
