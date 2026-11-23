"use client";

import { useTranslations } from "next-intl";
import { useRef, useState, type FC } from "react";
import { Calendar04Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { dateToISO, isoToDate, useDateFormatter, useDateParser } from "@/lib/date";
import { Calendar } from "@/components/desact/calendar";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/desact/popover";
import { cn } from "@/lib/cn";

export { dateToISO, isoToDate } from "@/lib/date";

export const isValidISO = (iso: string) =>
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

/** The bounds as one test, for the calendar and for a typed date. */
export const outsideBounds = (min?: string, max?: string) => (day: Date) => {
  const iso = dateToISO(day);
  return Boolean((min && isValidISO(min) && iso < min) || (max && isValidISO(max) && iso > max));
};

/** The field's own look — the input and its icons — shared with the range field. */
export const dateFieldClasses = (invalid: boolean, className?: string) =>
  cn(
    "flex h-9 w-full cursor-text items-center gap-2 rounded-control border border-field bg-card px-2.5 text-body outline-none transition-[border-color,box-shadow] duration-(--duration-hover)",
    "hover:border-field-hover focus-within:border-accent focus-within:shadow-focus",
    invalid && "border-danger hover:border-danger",
    className,
  );

/**
 * The app's one date field (rule 4; the designers' X5 and AQ-02, `FORMS_AND_FIELDS.md` § "Date fields"). **The field
 * takes a typed date** — "14 Mar 2031", "14.03.2031", "Mar 14, 2031" in the company's order (U9) — and the picker opens
 * from it, 4 under it: {@link Calendar}, 300 wide, month and year menus, Today and Clear. A typed date moves the month to
 * it at once and is kept on Enter, on Tab or when the field is left; one that is not a date goes back to the last value.
 * The value stays an ISO string, so callers, forms and the API keep the shape they already had.
 */
export const DatePicker: FC<Props> = ({
  value,
  onChange,
  id,
  disabled = false,
  placeholder,
  min,
  max,
  clearable = true,
  invalid = false,
  ariaLabel,
  className,
}) => {
  const t = useTranslations("common");
  const formatDisplayDate = useDateFormatter();
  const parse = useDateParser();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState<string | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = value && isValidISO(value) ? isoToDate(value) : undefined;
  const isDisabled = outsideBounds(min, max);
  const typedDate = typed !== null ? parse(typed) : null;
  const shown = selected ? formatDisplayDate(selected, { style: "medium" }) : "";

  const commit = (next: string) => {
    setTyped(null);
    if (next !== value) onChange(next);
  };

  /** What was typed becomes the value when it is a date the field allows; otherwise the last value stays. */
  const settle = () => {
    if (typed === null) return;
    if (typed.trim() === "" && clearable) commit("");
    else if (typedDate && !isDisabled(typedDate)) commit(dateToISO(typedDate));
    else setTyped(null);
  };

  return (
    <Popover
      open={open && !disabled}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) settle();
      }}
    >
      <PopoverAnchor asChild>
        <div
          ref={anchorRef}
          data-invalid={invalid || undefined}
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
            value={typed ?? shown}
            placeholder={placeholder ?? t("datePicker.pickDate")}
            onChange={(e) => {
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
                setOpen(false);
              } else if (e.key === "ArrowDown" && !open) {
                e.preventDefault();
                setOpen(true);
              } else if (e.key === "Tab") {
                settle();
                setOpen(false);
              }
            }}
            onBlur={(e) => {
              const next = e.relatedTarget as Node | null;
              if (next && document.querySelector("[data-slot='calendar']")?.contains(next)) return;
              settle();
            }}
            className="h-full min-w-0 flex-1 truncate bg-transparent text-primary outline-none placeholder:text-tertiary disabled:cursor-not-allowed"
          />
          {clearable && selected && !disabled && (
            <button
              type="button"
              tabIndex={-1}
              aria-label={t("datePicker.clearDate")}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(event) => {
                event.stopPropagation();
                commit("");
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
          mode="single"
          selected={typedDate ?? selected}
          defaultMonth={typedDate ?? selected}
          onSelect={(day) => {
            commit(dateToISO(day));
            setOpen(false);
          }}
          isDisabled={min || max ? isDisabled : undefined}
          onToday={isDisabled(new Date()) ? undefined : () => {
            commit(dateToISO(new Date()));
            setOpen(false);
          }}
          onClear={clearable ? () => {
            commit("");
            setOpen(false);
          } : undefined}
        />
      </PopoverContent>
    </Popover>
  );
};
