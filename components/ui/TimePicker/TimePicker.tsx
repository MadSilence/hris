"use client";

import { useTranslations } from "next-intl";
import { useState, type FC } from "react";
import { Clock01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/desact/popover";
import { cn } from "@/lib/cn";

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
  const t = useTranslations("common");
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
      "w-full rounded-control px-3 py-1.5 text-center text-body tabular-nums transition-colors",
      selected ? "bg-accent text-on-accent" : "text-primary hover:bg-mist",
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
            "flex h-9 w-full items-center gap-2 rounded-control border border-field bg-card px-3 text-body outline-none transition-colors",
            "hover:border-strong disabled:cursor-not-allowed disabled:opacity-50",
            "focus-visible:border-accent focus-visible:ring-accent-ring/50 focus-visible:ring-[3px]",
            className,
          )}
        >
          <Icon icon={Clock01Icon} size="sm" className="shrink-0 text-tertiary" />
          <span className={cn("min-w-0 flex-1 truncate text-left tabular-nums", !value && "text-tertiary")}>
            {value || placeholder}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-2" align="start">
        <div className="flex gap-2">
          <div className="flex max-h-56 w-16 flex-col gap-0.5 overflow-y-auto" role="listbox" aria-label={t("timePicker.hour")}>
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
          <div className="w-px bg-mist" aria-hidden />
          <div className="flex max-h-56 w-16 flex-col gap-0.5 overflow-y-auto" role="listbox" aria-label={t("timePicker.minute")}>
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
