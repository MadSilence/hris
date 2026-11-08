"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/desact/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/desact/command";
import { cn } from "@/lib/cn";
import { parseTokens, readEditable } from "./tokens";

export type TokenTextFieldProps = {
  /** The stored text: plain, with `{name}` for a field. */
  value: string;
  onChange: (value: string) => void;
  /** The fields that may be inserted: the catalogue's placeholders and the trigger event's. */
  placeholders: string[];
  /** A message (several lines) or a subject (one line, tokens inline, an ellipsis when long). */
  multiline?: boolean;
  /** "Insert a field" under the field — the email's Message. "@" works everywhere. */
  insertButton?: boolean;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  invalid?: boolean;
  disabled?: boolean;
};

const KNOWN = [
  "firstName",
  "lastName",
  "fullName",
  "startDate",
  "lastWorkingDay",
  "managerName",
  "companyName",
  "jobTitle",
  "office",
  "department",
  "leaveType",
  "leaveStart",
  "leaveEnd",
  "leaveDays",
  "processName",
  "processType",
] as const;
type Known = (typeof KNOWN)[number];

/** A placeholder's name in words; one the catalogue does not know reads as its key. */
export const usePlaceholderLabel = () => {
  const tA = useTranslations("automations");
  return React.useCallback(
    (name: string) => ((KNOWN as readonly string[]).includes(name) ? tA(`placeholder.${name as Known}`) : name),
    [tA],
  );
};

/** A token chip (`automations-steps` § Values): accent-subtle with accent text, radius 6, 13/18. */
export const TOKEN_CLASS = "mx-px inline-block rounded-tag bg-accent-subtle px-1.5 align-baseline text-label text-accent-text";

const tokenElement = (name: string, label: string): HTMLSpanElement => {
  const span = document.createElement("span");
  span.setAttribute("data-token", name);
  span.setAttribute("contenteditable", "false");
  span.className = TOKEN_CLASS;
  span.textContent = label;
  return span;
};

const paint = (root: HTMLElement, value: string, label: (n: string) => string) => {
  const nodes = parseTokens(value).map((p) => (p.kind === "text" ? document.createTextNode(p.text) : tokenElement(p.name, label(p.name))));
  root.replaceChildren(...nodes);
};

/** The node just before the caret, when it is a token — what Backspace takes as a whole. */
const tokenBeforeCaret = (root: HTMLElement): HTMLElement | null => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return null;
  const { startContainer: node, startOffset: offset } = sel.getRangeAt(0);
  let before: Node | null = null;
  if (node.nodeType === 3) {
    if (offset > 0 && (node.nodeValue ?? "").slice(0, offset).replace(/​/g, "") !== "") return null;
    before = node.previousSibling;
  } else if (node === root || root.contains(node)) {
    before = node.childNodes[offset - 1] ?? null;
  }
  return before instanceof HTMLElement && before.hasAttribute("data-token") ? before : null;
};

const caretAtEnd = (root: HTMLElement): Range => {
  const range = document.createRange();
  range.selectNodeContents(root);
  range.collapse(false);
  return range;
};

/**
 * A text field or a textarea with field tokens as chips (`automations-steps` § New components): "@" or "Insert a
 * field" opens the list of fields, the pick becomes a chip, Backspace removes a whole chip. The stored value stays
 * `{name}` text, so nothing about the storage changes.
 *
 * <p>Built on `contentEditable`: the DOM is the editor's own between renders, and it is painted from `value` only when
 * the value changes from outside — the echo of the field's own typing would otherwise move the caret.
 */
export const TokenTextField: React.FC<TokenTextFieldProps> = ({
  value,
  onChange,
  placeholders,
  multiline = false,
  insertButton = false,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": labelledBy,
  "aria-describedby": describedBy,
  invalid,
  disabled,
}) => {
  const t = useTranslations("automationsSettings");
  const tCommon = useTranslations("common");
  const label = usePlaceholderLabel();
  const ref = React.useRef<HTMLDivElement>(null);
  const emitted = React.useRef<string | null>(null);
  const saved = React.useRef<Range | null>(null);
  const fromAt = React.useRef(false);
  const [open, setOpen] = React.useState(false);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el || value === emitted.current) return;
    paint(el, value, label);
    emitted.current = value;
  }, [value, label]);

  const emit = () => {
    const el = ref.current;
    if (!el) return;
    const next = readEditable(el);
    emitted.current = next;
    if (next !== value) onChange(next);
  };

  const remember = () => {
    const sel = window.getSelection();
    const el = ref.current;
    if (sel && sel.rangeCount > 0 && el && el.contains(sel.getRangeAt(0).startContainer)) {
      saved.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const openList = (afterAt: boolean) => {
    remember();
    fromAt.current = afterAt;
    setOpen(true);
  };

  const insert = (name: string) => {
    const el = ref.current;
    if (!el) return;
    const range = saved.current && el.contains(saved.current.startContainer) ? saved.current : caretAtEnd(el);
    // The "@" that opened the list goes; the token takes its place.
    if (fromAt.current && range.startContainer.nodeType === 3 && range.startOffset > 0) {
      const text = range.startContainer as Text;
      const at = range.startOffset - 1;
      if ((text.nodeValue ?? "")[at] === "@") {
        // Placed by the "@"'s own offset: a live range already moves back when the text before it is deleted, and
        // moving it back once more put the chip before the space — "Hi @" became "Hi" + chip + " " (walk of 2026-11-07).
        text.deleteData(at, 1);
        range.setStart(text, at);
        range.collapse(true);
      }
    }
    const chip = tokenElement(name, label(name));
    range.insertNode(chip);
    const after = document.createRange();
    after.setStartAfter(chip);
    after.collapse(true);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(after);
    saved.current = after.cloneRange();
    fromAt.current = false;
    setOpen(false);
    emit();
    el.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    if (e.key === "Backspace") {
      const token = tokenBeforeCaret(el);
      if (token) {
        e.preventDefault();
        const range = document.createRange();
        range.setStartBefore(token);
        range.collapse(true);
        token.remove();
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        emit();
      }
      return;
    }
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      return;
    }
    if (e.key === "Escape" && open) setOpen(false);
  };

  const onInput = () => {
    emit();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const { startContainer, startOffset } = sel.getRangeAt(0);
    if (startContainer.nodeType === 3 && (startContainer.nodeValue ?? "")[startOffset - 1] === "@") openList(true);
  };

  const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    // Only text comes in — a pasted page's markup would become part of the message.
    e.preventDefault();
    const raw = e.clipboardData.getData("text/plain");
    const text = multiline ? raw : raw.replace(/\s*\n\s*/g, " ");
    const el = ref.current;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const node = document.createTextNode(text);
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    emit();
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div
            ref={ref}
            id={id}
            role="textbox"
            aria-multiline={multiline}
            aria-label={ariaLabel}
            aria-labelledby={labelledBy}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            aria-disabled={disabled || undefined}
            contentEditable={!disabled}
            suppressContentEditableWarning
            tabIndex={disabled ? -1 : 0}
            onKeyDown={onKeyDown}
            onKeyUp={remember}
            onMouseUp={remember}
            onBlur={remember}
            onInput={onInput}
            onPaste={onPaste}
            className={cn(
              "w-full rounded-control border border-field bg-card px-3 text-body text-primary outline-none",
              "transition-[border-color,box-shadow] hover:border-field-hover focus:border-accent focus:shadow-focus",
              "aria-invalid:border-danger",
              multiline ? "min-h-24 whitespace-pre-wrap break-words py-2 leading-6" : "flex h-9 items-center overflow-hidden whitespace-nowrap text-ellipsis",
              disabled && "cursor-not-allowed bg-subtle text-disabled",
            )}
          />
        </PopoverAnchor>
        {/* The list takes the focus — its search filters as the reader keeps typing, Enter picks, arrows move. Kept in
            the field, Enter after "@" broke the line instead (walk of 2026-11-07). Closing gives the caret back. */}
        <PopoverContent
          align="start"
          className="w-64 p-0"
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            const el = ref.current;
            if (!el) return;
            el.focus();
            if (saved.current && el.contains(saved.current.startContainer)) {
              const sel = window.getSelection();
              sel?.removeAllRanges();
              sel?.addRange(saved.current);
            }
          }}
        >
          <Command>
            <CommandInput placeholder={tCommon("actions.search")} />
            <CommandList className="max-h-72">
              <CommandEmpty>{t("common.noFieldsMatch")}</CommandEmpty>
              <CommandGroup heading={t("tokens.fields")}>
                {placeholders.map((name) => (
                  <CommandItem key={name} value={`${label(name)} ${name}`} onSelect={() => insert(name)}>
                    {label(name)}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {insertButton && !disabled && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-fit gap-1.5 px-2 text-secondary"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => openList(false)}
        >
          <Icon icon={Add01Icon} size="sm" />
          {t("tokens.insert")}
        </Button>
      )}
    </div>
  );
};

/** A stored text drawn with its tokens as chips, for read mode (R3). */
export const TokenText: React.FC<{ value: string | null | undefined; className?: string }> = ({ value, className }) => {
  const label = usePlaceholderLabel();
  return (
    <span className={cn("whitespace-pre-wrap", className)}>
      {parseTokens(value).map((p, i) =>
        p.kind === "text" ? (
          <React.Fragment key={i}>{p.text}</React.Fragment>
        ) : (
          <span key={i} className={TOKEN_CLASS}>
            {label(p.name)}
          </span>
        ),
      )}
    </span>
  );
};
