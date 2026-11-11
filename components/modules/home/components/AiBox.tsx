"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { ArrowUp02Icon, SparklesIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/desact/avatar";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { useGlobalSearch } from "@/components/modules/search/hooks";
import { NEEDS_ACTION_INBOX_HREF } from "@/components/modules/notifications/utils/inboxFilters";
import { cn } from "@/lib/cn";
import { useRequestTimeOff } from "./HomeRequestTimeOff";

/** Six lines of 20 px, then the text scrolls inside (A02). */
const MAX_TEXT_HEIGHT = 120;

type Row = { key: string; group: "people" | "do" | "ask"; label: string; detail?: string | null; avatarUrl?: string | null; run: () => void };

const initialsOf = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("") || "?";

/**
 * The box next to the greeting (`home` spec, A01–A02): ask, search or tell noddo what to do. Focused, it grows upward
 * for the text and the chips; what it finds opens **under** it, over the cards. **A stub where the
 * assistant goes** (DECISIONS.md § "The home redesign"): People are quick search's, Do is a short list of Home's own
 * actions, and *Ask noddo* says the assistant is on its way and sends nothing. `/` focuses it from anywhere on Home;
 * Esc closes it and keeps the text.
 */
export const AiBox: React.FC<{ onEditHome?: () => void; className?: string }> = ({ onEditHome, className }) => {
  const t = useTranslations("home");
  const router = useRouter();
  const { userId } = useCurrentUser();
  const requestTimeOff = useRequestTimeOff();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [active, setActive] = useState(-1);
  const area = useRef<HTMLTextAreaElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const listId = useId();
  const search = useGlobalSearch(text, []);
  const term = text.trim();

  // "/" focuses the box, unless the reader is already typing somewhere.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) return;
      event.preventDefault();
      setOpen(true);
      area.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Clicking away closes it; the text stays.
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // The textarea grows with its text, up to six lines.
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXT_HEIGHT)}px`;
  }, [text, open]);

  const ask = () => {
    toast(t("ai.notYet"));
  };

  const actions = useMemo(
    () =>
      [
        requestTimeOff ? { key: "request", label: t("ai.actions.requestTimeOff"), run: requestTimeOff } : null,
        { key: "whos-out", label: t("ai.actions.whosOut"), run: () => router.push("/calendar") },
        userId ? { key: "my-time-off", label: t("ai.actions.myTimeOff"), run: () => router.push(`/organization/people/${userId}/time-off`) } : null,
        { key: "my-tasks", label: t("ai.actions.myTasks"), run: () => router.push("/tasks") },
        { key: "inbox", label: t("ai.actions.inbox"), run: () => router.push(NEEDS_ACTION_INBOX_HREF) },
        onEditHome ? { key: "edit-home", label: t("ai.actions.editHome"), run: onEditHome } : null,
      ].filter((a): a is { key: string; label: string; run: () => void } => a !== null),
    [requestTimeOff, router, t, userId, onEditHome],
  );

  const rows: Row[] = useMemo(() => {
    if (term.length < 2) return [];
    const needle = term.toLocaleLowerCase();
    const people = (search.groups.find((g) => g.kind === "PEOPLE")?.items ?? []).slice(0, 4).map(
      (item): Row => ({
        key: `person-${item.id}`,
        group: "people",
        label: item.title,
        detail: item.subtitle,
        avatarUrl: item.avatarUrl,
        run: () => router.push(`/organization/people/${item.id}/personal`),
      }),
    );
    const doing = actions
      .filter((a) => a.label.toLocaleLowerCase().includes(needle))
      .map((a): Row => ({ key: `do-${a.key}`, group: "do", label: a.label, run: a.run }));
    return [...people, ...doing, { key: "ask", group: "ask", label: t("ai.askRow", { text: term }), run: ask }];
    // `ask` is stable in what it does; leaving it out keeps the list from rebuilding on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, search.groups, actions, router, t]);

  const close = () => {
    setOpen(false);
    setActive(-1);
  };

  const runRow = (row: Row) => {
    close();
    row.run();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      area.current?.blur();
      return;
    }
    if (event.key === "ArrowDown" && rows.length > 0) {
      event.preventDefault();
      setActive((i) => (i + 1) % rows.length);
      return;
    }
    if (event.key === "ArrowUp" && rows.length > 0) {
      event.preventDefault();
      setActive((i) => (i <= 0 ? rows.length - 1 : i - 1));
      return;
    }
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (active >= 0 && rows[active]) runRow(rows[active]);
      else if (term) {
        close();
        ask();
      }
    }
  };

  const chip = (label: string, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 shrink-0 items-center rounded-pill border border-field bg-card px-3 text-label text-secondary hover:border-strong hover:text-primary"
    >
      {label}
    </button>
  );

  const send = (
    <button
      type="button"
      aria-label={t("ai.send")}
      onClick={() => {
        if (active >= 0 && rows[active]) runRow(rows[active]);
        else if (term) ask();
      }}
      className="flex size-10 shrink-0 items-center justify-center rounded-tint bg-accent text-on-accent hover:bg-accent-hover"
    >
      <Icon icon={ArrowUp02Icon} size="md" />
    </button>
  );

  const groups: { id: Row["group"]; label: string }[] = [
    { id: "people", label: t("ai.groups.people") },
    { id: "do", label: t("ai.groups.do") },
    { id: "ask", label: t("ai.groups.ask") },
  ];
  const peopleFound = rows.some((r) => r.group === "people");
  const doFound = rows.some((r) => r.group === "do");

  return (
    <div ref={root} className={cn("relative h-14 w-[520px] max-w-full shrink-0", className)}>
      <div
        className={cn(
          "absolute right-0 bottom-0 z-20 flex flex-col rounded-ai-box bg-card shadow-popover transition-[width] duration-(--duration-reorder)",
          open ? "w-[640px] max-w-[calc(100vw-48px)] gap-3 p-4" : "h-14 w-full flex-row items-center gap-3 py-0 pr-2 pl-[18px]",
        )}
      >
        {!open && <Icon icon={SparklesIcon} size="md" className="shrink-0 text-accent" />}
        <div className={cn("flex min-w-0 items-start gap-3", open ? "w-full" : "flex-1")}>
          {open && <Icon icon={SparklesIcon} size="md" className="mt-0.5 shrink-0 text-accent" />}
          <textarea
            ref={area}
            rows={1}
            value={text}
            aria-label={t("ai.label")}
            placeholder={t("ai.placeholder")}
            role="combobox"
            aria-expanded={open && rows.length > 0}
            aria-controls={listId}
            aria-activedescendant={active >= 0 && rows[active] ? `${listId}-${rows[active].key}` : undefined}
            onFocus={() => setOpen(true)}
            onChange={(event) => {
              setText(event.target.value);
              setActive(-1);
            }}
            onKeyDown={onKeyDown}
            className="min-w-0 flex-1 resize-none bg-transparent py-0.5 text-body text-primary outline-none placeholder:text-tertiary"
          />
        </div>
        {open ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              {requestTimeOff && chip(t("ai.chips.requestTimeOff"), () => { close(); requestTimeOff(); })}
              {chip(t("ai.chips.whosOutFriday"), () => setText(t("ai.chips.whosOutFriday")))}
              {chip(t("ai.chips.myBalance"), () => setText(t("ai.chips.myBalance")))}
              <span className="ml-auto flex items-center gap-3">
                <span className="text-hint text-tertiary">{t("ai.hint")}</span>
                {send}
              </span>
            </div>
          </>
        ) : (
          <>
            {requestTimeOff && chip(t("ai.chips.requestTimeOff"), requestTimeOff)}
            {send}
          </>
        )}
      </div>
            {open && term.length >= 2 && (
              <ul
                id={listId}
                role="listbox"
                className="absolute top-full right-0 z-30 mt-2 flex max-h-[360px] w-[640px] max-w-[calc(100vw-48px)] flex-col gap-1 overflow-y-auto rounded-popover border border-divider bg-overlay p-2 shadow-popover"
              >
                {!peopleFound && !doFound && !search.isLoading && (
                  <li className="px-2 py-1 text-label text-tertiary">{t("ai.noResults", { text: term })}</li>
                )}
                {groups.map((group) => {
                  const inGroup = rows.filter((r) => r.group === group.id);
                  if (inGroup.length === 0) return null;
                  return (
                    <li key={group.id} className="flex flex-col">
                      <p className="px-2 pt-1 pb-0.5 text-hint font-semibold text-tertiary">{group.label}</p>
                      <ul className="flex flex-col">
                        {inGroup.map((row) => {
                          const index = rows.indexOf(row);
                          return (
                            <li
                              key={row.key}
                              id={`${listId}-${row.key}`}
                              role="option"
                              aria-selected={index === active}
                              onMouseEnter={() => setActive(index)}
                              onMouseDown={(event) => {
                                event.preventDefault();
                                runRow(row);
                              }}
                              className={cn(
                                "flex cursor-pointer items-center gap-2.5 rounded-control px-2 py-1.5 text-body",
                                index === active ? "bg-subtle" : "hover:bg-subtle",
                              )}
                            >
                              {row.group === "people" && (
                                <Avatar className="size-6">
                                  {row.avatarUrl && <AvatarImage src={row.avatarUrl} alt="" />}
                                  <AvatarFallback name={row.label} className="text-hint">{initialsOf(row.label)}</AvatarFallback>
                                </Avatar>
                              )}
                              <span className="truncate text-primary">{row.label}</span>
                              {row.detail && <span className="truncate text-hint text-tertiary">{row.detail}</span>}
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            )}
    </div>
  );
};
