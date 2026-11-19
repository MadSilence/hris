"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
import { ArrowDown01Icon, Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons";

import { Icon } from "@/components/desact/icon";
import { fieldClasses } from "@/components/desact/input";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/desact/popover";
import { cn } from "@/lib/cn";

export type ComboboxOption = {
  value: string;
  label: string;
  /** Extra words the search should match — a country code, an alias. Never shown. */
  keywords?: string;
  /** Drawn before the label: a flag, an icon. */
  icon?: React.ReactNode;
  /** A quiet note after the label, for what the choice implies. */
  hint?: string;
  /** Drawn after the label and its hint — a "Custom" tag. */
  trailing?: React.ReactNode;
  /** The heading the option sits under. Groups keep first-seen order. */
  group?: string;
  /** Indent steps, for a tree read as a list — a department under its parent. */
  depth?: number;
  /** Listed but not choosable; the hint says why. */
  disabled?: boolean;
};

/** Lower case, accents off: "Zürich" is found by "zur". */
const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase();

const matches = (option: ComboboxOption, query: string): boolean => {
  const q = fold(query.trim());
  if (!q) return true;
  return fold(option.label).includes(q) || (option.keywords ? fold(option.keywords).includes(q) : false);
};

/**
 * The label with the letters the reader typed in 600 Ink (hub A18). Folding keeps the string's length for the
 * Latin and Cyrillic letters a name is written in, so the match's place in the folded label is its place in the label.
 */
export const HighlightedLabel: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  const q = fold(query.trim());
  const folded = fold(text);
  const at = q && folded.length === text.length ? folded.indexOf(q) : -1;
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <span className="font-semibold text-primary">{text.slice(at, at + q.length)}</span>
      {text.slice(at + q.length)}
    </>
  );
};

/**
 * The list's scrollbar: a thumb with no arrows, visible only while the list is moving. Chromium and Safari draw it
 * from the `::-webkit-scrollbar` parts; Firefox keeps its own thin overlay bar, which already behaves this way. A
 * scrollbar part ignores CSS transitions, so the fade is driven from script through `--thumb-alpha`.
 */
const AUTOHIDE_SCROLLBAR = cn(
  "[&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-track]:bg-transparent",
  "[&::-webkit-scrollbar-thumb]:rounded-pill [&::-webkit-scrollbar-thumb]:border-2",
  "[&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent",
  "[&::-webkit-scrollbar-thumb]:bg-clip-padding",
  "[&::-webkit-scrollbar-thumb]:bg-[color-mix(in_srgb,var(--border-strong)_calc(var(--thumb-alpha,0)*100%),transparent)]",
);

const SCROLLBAR_LINGER_MS = 600;
const SCROLLBAR_FADE_MS = 500;

/** Shows the thumb while the list moves; once it has been still for a moment, fades it out. */
const showScrollbarWhileScrolling = (event: React.UIEvent<HTMLElement>) => {
  const list = event.currentTarget;
  window.clearTimeout(Number(list.dataset.scrollTimer));
  window.cancelAnimationFrame(Number(list.dataset.fadeFrame));
  list.style.setProperty("--thumb-alpha", "1");
  list.dataset.scrollTimer = String(
    window.setTimeout(() => {
      const start = performance.now();
      const step = (now: number) => {
        const progress = Math.min((now - start) / SCROLLBAR_FADE_MS, 1);
        list.style.setProperty("--thumb-alpha", String((1 - progress) ** 2));
        if (progress < 1) list.dataset.fadeFrame = String(window.requestAnimationFrame(step));
      };
      list.dataset.fadeFrame = String(window.requestAnimationFrame(step));
    }, SCROLLBAR_LINGER_MS),
  );
};

type ComboboxBaseProps = {
  options: ComboboxOption[];
  /** The field's own text while nothing is chosen — "Select a field". It stays the placeholder while searching. */
  placeholder?: string;
  /** The muted row when nothing matches; "Nothing found" unless the caller has a better sentence. */
  emptyLabel?: string;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  /** Classes for the open list — a width the trigger's would cut short. */
  listClassName?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  /** `md` is the form field (36 high); `sm` the compact one inside a condition card (28 high). */
  size?: "sm" | "md";
  /** In place of the options: a loading ring, or "We couldn't load the list" with Try again. */
  listState?: React.ReactNode;
  /** Called as the list scrolls — the next page of a long list. */
  onListScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
  /** A row pinned under the list, past a hairline ("Pick a date"). */
  footer?: { label: string; onSelect: () => void } | null;
  /** The text the closed field shows, over the chosen label — a value the options do not list. */
  displayLabel?: string | null;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type ComboboxProps = ComboboxBaseProps &
  (
    | {
        multiple?: false;
        value: string | null;
        onChange: (value: string | null) => void;
        /** Choosing the chosen option again clears it. Off where the field must hold a value. */
        clearable?: boolean;
      }
    | {
        multiple: true;
        value: string[];
        onChange: (value: string[]) => void;
        clearable?: never;
        /**
         * The picks as tags inside the field, each with its ×, and the field grows to hold them (CM07 O4: "the value
         * field with tags"). Off, the closed field reads the picks as one line.
         */
        chips?: boolean;
      }
  );

/**
 * A dropdown that is its own search (the designers' hub fixes A18, 2026-11-19; `technical_documentation/ui/
 * FORMS_AND_FIELDS.md` § "A dropdown is its own search"). **The field is the input**: a click or the focus opens the
 * list 4 under it, typing goes straight into the field and narrows the list, the letters typed are 600 Ink in each
 * option, and nothing matching is one muted "Nothing found" row. There is no search row inside the list. Esc closes
 * and keeps the last value; Enter picks the highlighted option; the arrows move.
 *
 * <p>The popover is anchored, not triggered, and not modal: a modal popover traps the focus inside the list, and the
 * focus has to stay in the field. Its rows keep the focus there too (mousedown is prevented), as `PeoplePicker` does.
 */
export const Combobox: React.FC<ComboboxProps> = (props) => {
  const {
    options,
    placeholder,
    emptyLabel,
    id,
    disabled,
    invalid,
    className,
    listClassName,
    "aria-label": ariaLabel,
    "aria-labelledby": labelledBy,
    size = "md",
    listState,
    onListScroll,
    footer,
    displayLabel,
    defaultOpen = false,
    open: openFromOutside,
    onOpenChange,
  } = props;
  const t = useTranslations("common");
  const [openInside, setOpenInside] = React.useState(defaultOpen);
  const open = (openFromOutside ?? openInside) && !disabled;
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const listId = React.useId();

  const setOpen = (next: boolean) => {
    setOpenInside(next);
    onOpenChange?.(next);
    if (!next) setQuery("");
  };

  const chosen: string[] = props.multiple ? props.value : props.value == null ? [] : [props.value];
  const isChosen = (value: string) => chosen.includes(value);
  const chosenOptions = options.filter((o) => isChosen(o.value));
  const shown =
    displayLabel ?? (chosenOptions.length ? chosenOptions.map((o) => o.label).join(", ") : null);
  const single = !props.multiple ? (chosenOptions[0] ?? null) : null;
  const chips = props.multiple === true && props.chips === true && chosenOptions.length > 0;
  const unpick = (value: string) => {
    if (props.multiple) props.onChange(props.value.filter((v) => v !== value));
  };

  const visible = React.useMemo(() => options.filter((o) => matches(o, query)), [options, query]);
  const choosable = visible.filter((o) => !o.disabled);

  // Opening, and every keystroke, highlights the chosen option when it is listed, otherwise the first one.
  React.useEffect(() => {
    if (!open) return;
    const at = query ? -1 : choosable.findIndex((o) => isChosen(o.value));
    setActive(at >= 0 ? at : choosable.length ? 0 : -1);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on opening and on a new query
  }, [open, query]);

  const activeOption = active >= 0 ? choosable[active] : undefined;
  const optionId = (value: string) => `${listId}-${value}`;

  React.useEffect(() => {
    if (!open || !activeOption) return;
    const row = listRef.current?.querySelector<HTMLElement>(`[id="${CSS.escape(optionId(activeOption.value))}"]`);
    row?.scrollIntoView?.({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the row follows the highlight
  }, [open, activeOption?.value]);

  const pick = (option: ComboboxOption) => {
    if (option.disabled) return;
    if (props.multiple) {
      props.onChange(
        props.value.includes(option.value) ? props.value.filter((v) => v !== option.value) : [...props.value, option.value],
      );
      setQuery("");
      return;
    }
    const clearable = props.clearable ?? true;
    props.onChange(clearable && option.value === props.value ? null : option.value);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      if (!choosable.length) return;
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((a) => (a < 0 ? 0 : (a + step + choosable.length) % choosable.length));
    } else if (e.key === "Enter") {
      if (open && activeOption) {
        e.preventDefault();
        pick(activeOption);
      } else if (!open) {
        e.preventDefault();
        setOpen(true);
      }
    } else if (e.key === "Escape") {
      // Closing restores the last value: the query goes, the field shows what was chosen. A closed field lets Esc
      // through to the dialog it sits in.
      if (open) {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
      }
    } else if (e.key === "Tab") {
      if (open) setOpen(false);
    } else if (e.key === "Backspace" && chips && query === "") {
      // As in the people picker: Backspace in an empty field takes the last tag off.
      unpick(chosenOptions[chosenOptions.length - 1].value);
    }
  };

  const groups = React.useMemo(() => {
    const map = new Map<string, ComboboxOption[]>();
    for (const o of visible) map.set(o.group ?? "", [...(map.get(o.group ?? "") ?? []), o]);
    return [...map.entries()];
  }, [visible]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div
          ref={anchorRef}
          onMouseDown={(e) => {
            // A press on the chevron or the padding still lands in the field.
            if (disabled || e.target === inputRef.current) return;
            e.preventDefault();
            inputRef.current?.focus();
            setOpen(!open);
          }}
          data-state={open ? "open" : "closed"}
          className={cn(
            fieldClasses,
            "flex cursor-text items-center gap-2",
            size === "md" ? "h-9 px-3" : "h-7 gap-1.5 pr-2 pl-2.5 text-label",
            chips && "h-auto min-h-9 flex-wrap gap-1.5 py-1 pl-1.5",
            "focus-within:border-accent focus-within:shadow-focus",
            invalid && "border-danger hover:border-danger",
            disabled && "cursor-not-allowed bg-subtle text-disabled hover:border-field",
            className,
          )}
        >
          {!open && single?.icon}
          {chips &&
            chosenOptions.map((o) => (
              <span
                key={o.value}
                className="inline-flex h-6 max-w-full items-center gap-1 rounded-tag bg-mist pr-1 pl-2 text-hint font-medium text-secondary"
              >
                <span className="truncate">{o.label}</span>
                {!disabled && (
                  <button
                    type="button"
                    aria-label={t("actions.removeNamed", { label: o.label })}
                    onMouseDown={(e) => {
                      // The tag's own press: the field neither takes it nor toggles its list.
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      unpick(o.value);
                    }}
                    className="inline-flex shrink-0 items-center justify-center rounded-pill text-tertiary outline-none hover:text-secondary focus-visible:shadow-focus"
                  >
                    <Icon icon={Cancel01Icon} size="sm" className="size-3" />
                  </button>
                )}
              </span>
            ))}
          <input
            ref={inputRef}
            id={id}
            type="text"
            role="combobox"
            autoComplete="off"
            spellCheck={false}
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            aria-autocomplete="list"
            aria-activedescendant={open && activeOption ? optionId(activeOption.value) : undefined}
            aria-label={ariaLabel}
            aria-labelledby={labelledBy}
            aria-invalid={invalid || undefined}
            disabled={disabled}
            value={open || chips ? query : (shown ?? "")}
            placeholder={
              chips ? undefined : open ? (shown ?? placeholder ?? t("actions.select")) : (placeholder ?? t("actions.select"))
            }
            onChange={(e) => {
              setQuery(e.target.value);
              if (!open) setOpen(true);
            }}
            onClick={() => {
              if (!open) setOpen(true);
            }}
            onFocus={() => {
              if (!open) setOpen(true);
            }}
            onBlur={(e) => {
              const next = e.relatedTarget as Node | null;
              if (open && !(next && listRef.current?.contains(next))) setOpen(false);
            }}
            onKeyDown={onKeyDown}
            className={cn(
              "h-full min-w-0 flex-1 truncate bg-transparent text-primary outline-none placeholder:text-tertiary",
              chips && "h-6 min-w-12",
              "disabled:cursor-not-allowed disabled:text-disabled",
            )}
          />
          <Icon icon={ArrowDown01Icon} size="sm" className={cn("shrink-0 text-tertiary", size === "sm" && "size-3")} />
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        className={cn("w-[var(--radix-popover-trigger-width)] min-w-64 p-0", listClassName)}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          // A press back in the field is the field's own (it toggles the list).
          if (e.target instanceof Node && anchorRef.current?.contains(e.target)) e.preventDefault();
        }}
      >
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          aria-multiselectable={props.multiple || undefined}
          onScroll={(e) => {
            showScrollbarWhileScrolling(e);
            onListScroll?.(e);
          }}
          className={cn("max-h-80 overflow-y-auto p-1", AUTOHIDE_SCROLLBAR)}
        >
          {listState ??
            (visible.length === 0 ? (
              <div className="px-2 py-1.5 text-body text-tertiary">{emptyLabel ?? t("searchableSelect.empty")}</div>
            ) : (
              groups.map(([group, items]) => (
                <div key={group || "_"} role="group" aria-label={group || undefined}>
                  {group && <p className="px-2 pt-2 pb-1 text-hint font-medium text-tertiary">{group}</p>}
                  {items.map((o) => {
                    const isActive = activeOption?.value === o.value;
                    return (
                      <div
                        key={o.value}
                        id={optionId(o.value)}
                        role="option"
                        aria-selected={isChosen(o.value)}
                        aria-disabled={o.disabled || undefined}
                        data-highlighted={isActive || undefined}
                        onMouseDown={(e) => e.preventDefault()}
                        onMouseMove={() => {
                          if (o.disabled) return;
                          const at = choosable.indexOf(o);
                          if (at !== active) setActive(at);
                        }}
                        onClick={() => pick(o)}
                        style={o.depth ? { paddingLeft: `${0.5 + o.depth * 0.75}rem` } : undefined}
                        className={cn(
                          "flex min-h-8 cursor-default items-center gap-2 rounded-control px-2 py-1.5 text-body text-primary select-none",
                          isActive && "bg-accent-subtle",
                          o.disabled && "text-tertiary",
                        )}
                      >
                        {o.icon}
                        <span className="truncate">
                          <HighlightedLabel text={o.label} query={query} />
                        </span>
                        {o.hint && <span className="ml-2 shrink-0 text-hint text-tertiary">{o.hint}</span>}
                        {o.trailing}
                        <Icon
                          icon={Tick02Icon}
                          size="sm"
                          className={cn("ml-auto shrink-0 text-accent", isChosen(o.value) ? "opacity-100" : "opacity-0")}
                        />
                      </div>
                    );
                  })}
                </div>
              ))
            ))}
        </div>
        {footer && (
          <div className="border-t border-divider p-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                footer.onSelect();
                setOpen(false);
              }}
              className="flex min-h-8 w-full items-center rounded-control px-2 py-1.5 text-left text-body hover:bg-accent-subtle focus-visible:bg-accent-subtle focus-visible:outline-none"
            >
              {footer.label}
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
