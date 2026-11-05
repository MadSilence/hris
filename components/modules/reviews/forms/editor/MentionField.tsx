"use client";

import React, { useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/desact/input";
import { cn } from "@/lib/cn";
import {
  insertMention,
  mentionOptions,
  mentionQueryAt,
  splitMentions,
  type MentionToken,
} from "@/models/reviews";

/**
 * The Desact textarea's look. Desact's `Textarea` takes no ref under React 18, and the field needs one to put the caret
 * after an inserted token, so the element is drawn here with the same classes.
 */
const TEXTAREA = cn(
  "resize-none placeholder:text-tertiary focus-visible:border-accent focus-visible:ring-accent-ring/50 focus:border-accent aria-invalid:ring-status-declined-border/20 aria-invalid:border-danger flex field-sizing-content min-h-20 w-full rounded-control border border-field bg-card px-3 py-3 text-body transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-body",
  "hover:border-strong",
);

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
};

/**
 * A question's text with its mentions (Q2): typing `@` offers the tokens, and each token sits on a coloured background.
 * The field is the ordinary input or textarea, on a transparent background; behind it a mirror with the same box and
 * the same text — invisible — paints a background under each token. The text the reader types and selects is the real
 * field's, so nothing about editing changes.
 */
export function MentionField({
  id, value, onChange, multiline, rows = 2, disabled, className, "aria-label": ariaLabel, "aria-invalid": ariaInvalid,
}: Props) {
  const t = useTranslations("reviews");
  const listId = useId();
  const input = useRef<HTMLInputElement>(null);
  const area = useRef<HTMLTextAreaElement>(null);
  const field = multiline ? area : input;
  const mirror = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState<{ start: number; query: string } | null>(null);
  const [active, setActive] = useState(0);

  const options = query ? mentionOptions(query.query) : [];
  const open = !disabled && options.length > 0;

  const look = (el: HTMLInputElement | HTMLTextAreaElement) => {
    const q = mentionQueryAt(el.value, el.selectionStart ?? el.value.length);
    setQuery(q);
    setActive(0);
  };

  const syncScroll = () => {
    if (field.current && mirror.current) {
      mirror.current.scrollTop = field.current.scrollTop;
      mirror.current.scrollLeft = field.current.scrollLeft;
    }
  };

  const choose = (token: MentionToken) => {
    if (!query) return;
    const next = insertMention(value, query.start, query.query.length, token);
    onChange(next.text);
    setQuery(null);
    requestAnimationFrame(() => {
      field.current?.focus();
      field.current?.setSelectionRange(next.caret, next.caret);
      syncScroll();
    });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + options.length) % options.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      choose(options[Math.min(active, options.length - 1)].token);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setQuery(null);
    }
  };

  const shared = {
    id,
    value,
    disabled,
    "aria-label": ariaLabel,
    "aria-invalid": ariaInvalid,
    "aria-autocomplete": "list" as const,
    "aria-expanded": open,
    "aria-controls": open ? listId : undefined,
    "aria-activedescendant": open ? `${listId}-${active}` : undefined,
    onKeyDown,
    onScroll: syncScroll,
    onSelect: (e: React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => look(e.currentTarget),
    onBlur: () => setQuery(null),
  };

  // Mirror and field share padding, border width, font size and wrapping, so the tokens line up with their text.
  const box = multiline
    ? "px-3 py-3 whitespace-pre-wrap break-words"
    : "px-3 py-2 whitespace-pre overflow-hidden";

  return (
    <div className="relative">
      <div
        ref={mirror}
        aria-hidden
        data-test="mention-mirror"
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden rounded-control border border-transparent bg-card text-body text-transparent md:text-body",
          box,
          className,
        )}
      >
        {splitMentions(value).map((s, i) =>
          s.token
            ? <mark key={i} data-token={s.token} className="rounded-control bg-divider/80 text-transparent">{s.text}</mark>
            : <span key={i}>{s.text}</span>,
        )}
        {/* A trailing newline in a textarea opens a line the mirror would otherwise not have. */}
        {multiline && value.endsWith("\n") ? " " : null}
      </div>
      {multiline ? (
        <textarea
          ref={area}
          rows={rows}
          data-slot="textarea"
          className={cn(TEXTAREA, "relative bg-transparent", className)}
          onChange={(e) => { onChange(e.target.value); look(e.target); }}
          {...shared}
        />
      ) : (
        <Input
          ref={input}
          className={cn("relative bg-transparent", className)}
          onChange={(e) => { onChange(e.target.value); look(e.target); }}
          {...shared}
        />
      )}
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={t("mentions.listLabel")}
          className="absolute left-0 top-full z-20 mt-1 w-72 rounded-control border border-divider bg-card py-1 text-body shadow-raised"
        >
          {options.map((o, i) => (
            <li
              key={o.token}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              className={cn("cursor-pointer px-3 py-1.5", i === active && "bg-subtle")}
              // Keeps the focus in the field, so the caret is where the token goes.
              onMouseDown={(e) => { e.preventDefault(); choose(o.token); }}
              onMouseEnter={() => setActive(i)}
            >
              <span className="font-medium text-primary">@{o.token}</span>
              <span className="ml-2 text-hint text-tertiary">{t(o.labelKey)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
