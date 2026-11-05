"use client";

import { useEffect, useId, useMemo, useRef, useState, type FC } from "react";
import { Search01Icon, Tick02Icon, UnfoldMoreIcon } from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/desact/icon";

import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/desact/popover";
import { cn } from "@/lib/cn";
import { CountryFlag } from "@/components/ui/CountryFlag";
import type { PublicHolidayTemplate } from "@/models/publicHolidays/template";

/**
 * "Afghanistan holidays" → "Afghanistan".
 *
 * Every seeded template name ends in the same word, so repeating it on 237 rows is noise. The trim is
 * display-only — the stored name is what gets copied onto a new calendar.
 */
export const templateDisplayName = (template: PublicHolidayTemplate): string =>
  template.name.replace(/\s+holidays$/i, "").trim() || template.name;

type Props = {
  templates: PublicHolidayTemplate[];
  value: string;
  onChange: (templateId: string) => void;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
};

/**
 * Template picker whose trigger turns into the search field when it opens.
 *
 * A Radix `Select` with a search box inside its list stacks two bordered boxes on top of each other.
 * Here the control keeps exactly one border: closed it reads as a select, open it *is* the input, and
 * the list hangs off it with nothing but its own frame.
 */
export const PublicHolidayTemplatePicker: FC<Props> = ({
  templates,
  value,
  onChange,
  disabled = false,
  placeholder,
  id,
}) => {
  const t = useTranslations("timeOff");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => templates.find((template) => template.id === value) ?? null,
    [templates, value],
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      // Opening from the chevron leaves focus wherever it was; put the caret in the field either way.
      inputRef.current?.focus();
    }
  }, [open]);

  /*
   * The list scrolls itself, with a non-passive listener, and that is not a flourish.
   *
   * Inside a dialog this list cannot scroll otherwise. Radix's dialog wraps the page in
   * `react-remove-scroll` and allows exactly one subtree — the dialog's own content
   * (`shards: [contentRef]`). This list is **portalled to `<body>`**, so every wheel event over it is
   * outside both, and the lock calls `preventDefault()` on it: 237 countries, and the wheel does
   * nothing. Moving the list inside the dialog instead is not the fix — `DialogContent` is
   * `translate-x-[-50%]`, and a transformed ancestor makes the popover's fixed positioning land in
   * the wrong place.
   *
   * So the list does the scrolling itself. The listener is native and non-passive because React
   * attaches `onWheel` passively, where `preventDefault` is ignored — and without it the page would
   * scroll *as well* on the screens where nothing is locked.
   */
  useEffect(() => {
    const list = listRef.current;
    if (!open || !list) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      list.scrollTop += event.deltaY;
    };

    list.addEventListener("wheel", onWheel, { passive: false });
    return () => list.removeEventListener("wheel", onWheel);
  }, [open]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return templates;

    return templates.filter((template) =>
      [
        template.name,
        template.countryName,
        template.countryCode,
        template.regionName,
        template.regionCode,
        template.languageCode,
        template.description,
      ]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(normalized)),
    );
  }, [templates, query]);

  const select = (templateId: string) => {
    onChange(templateId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/*
        * The box is the anchor, not the trigger, and the field inside it never unmounts.
        *
        * Both matter. A trigger around the whole box would toggle the list shut the moment the search
        * field is clicked. And swapping the closed-state button out for an input on open dropped focus
        * to <body> mid-click, which Radix reads as "focus left the layer" and dismisses on — the list
        * closed the instant it appeared. One input, always mounted: focus never leaves.
        */}
      <PopoverAnchor asChild>
        <div
          ref={boxRef}
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-control border border-field bg-card px-3 text-body transition-colors",
            !disabled && "cursor-text hover:border-strong",
            disabled && "cursor-not-allowed opacity-50",
            open && "border-strong",
          )}
          onClick={() => !disabled && setOpen(true)}
        >
          {open ? (
            <Icon icon={Search01Icon} size="sm" className="shrink-0 text-tertiary" />
          ) : (
            selected && <CountryFlag countryCode={selected.countryCode} />
          )}

          <input
            id={id}
            ref={inputRef}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            autoComplete="off"
            disabled={disabled}
            /* Closed, the field is a label for the current choice — only the open state is typable. */
            readOnly={!open}
            value={open ? query : selected ? templateDisplayName(selected) : ""}
            placeholder={open ? t("publicHolidays.picker.search") : (placeholder ?? t("publicHolidays.picker.placeholder"))}
            onChange={(event) => setQuery(event.currentTarget.value)}
            /*
             * Opening on focus is wrong: a dialog autofocuses its first field, so the list flashed
             * open and shut the moment the modal appeared. Only a real gesture opens it — the click
             * on the box, or a key that means "show me the options".
             */
            onKeyDown={(event) => {
              if (open || disabled) return;
              if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) {
                event.preventDefault();
                setOpen(true);
              }
            }}
            className={cn(
              "h-full min-w-0 flex-1 truncate border-0 bg-transparent p-0 text-body text-primary outline-none",
              "placeholder:text-tertiary disabled:cursor-not-allowed",
              !open && "cursor-pointer",
            )}
          />

          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            aria-label={open ? t("publicHolidays.picker.closeList") : t("publicHolidays.picker.openList")}
            /* Keeps the click from stealing focus off the field before the toggle runs. */
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => {
              event.stopPropagation();
              setOpen((current) => !current);
            }}
            className="flex shrink-0 items-center text-tertiary disabled:cursor-not-allowed"
          >
            <Icon icon={UnfoldMoreIcon} size="sm" />
          </button>
        </div>
      </PopoverAnchor>

      <PopoverContent
        align="start"
        sideOffset={4}
        onOpenAutoFocus={(event) => event.preventDefault()}
        /* Restoring focus to the field on close would trip its onFocus and reopen the list. */
        onCloseAutoFocus={(event) => event.preventDefault()}
        // The search field lives in the anchor, which is "outside" as far as the layer is
        // concerned. Without this, the first click into it dismisses the list.
        onInteractOutside={(event) => {
          if (boxRef.current?.contains(event.target as Node)) event.preventDefault();
        }}
        ref={listRef}
        id={listId}
        role="listbox"
        className="max-h-72 w-[var(--radix-popover-trigger-width)] overflow-y-auto overscroll-contain p-1"
      >
        {filtered.length === 0 ? (
          <p className="px-2 py-6 text-center text-body text-tertiary">
            {t("publicHolidays.picker.none")}
          </p>
        ) : (
          filtered.map((template) => {
            const isSelected = template.id === value;

            return (
              <button
                key={template.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => select(template.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-control px-2 py-1.5 text-left text-body transition-colors hover:bg-subtle",
                  isSelected && "bg-subtle",
                )}
              >
                <CountryFlag countryCode={template.countryCode} />
                <span className="min-w-0 flex-1 truncate text-primary">
                  {templateDisplayName(template)}
                </span>
                {isSelected && <Icon icon={Tick02Icon} size="sm" className="flex-none text-secondary" />}
              </button>
            );
          })
        )}
      </PopoverContent>
    </Popover>
  );
};
