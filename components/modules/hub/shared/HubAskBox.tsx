"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { ArrowUp02Icon, File01Icon, Megaphone01Icon, SparklesIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { cn } from "@/lib/cn";
import { useHubSearch } from "../hooks";

type Row = { key: string; group: "pages" | "news" | "ask"; label: string; detail?: string | null; run: () => void };

/**
 * The hub's ask box — Home's `AiBox` in its hub variant (Q-10): **Pages** and **News** come from the hub's search over
 * what the reader may see; **Ask noddo** says the assistant is on its way and sends nothing, as on Home. CP01's box
 * (`pagesOnly`) searches handbook pages alone.
 */
export const HubAskBox: React.FC<{ placeholder: string; pagesOnly?: boolean; className?: string }> = ({ placeholder, pagesOnly = false, className }) => {
  const t = useTranslations("hub");
  const tHome = useTranslations("home");
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState("");
  const [active, setActive] = React.useState(-1);
  const root = React.useRef<HTMLDivElement>(null);
  const listId = React.useId();
  const term = text.trim();
  const search = useHubSearch(term, pagesOnly);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const ask = React.useCallback(() => {
    toast(tHome("ai.notYet"));
  }, [tHome]);

  const rows: Row[] = React.useMemo(() => {
    if (term.length < 2) return [];
    const pages = (search.data?.pages ?? []).slice(0, 5).map(
      (hit): Row => ({ key: `page-${hit.id}`, group: "pages", label: hit.title, detail: hit.context, run: () => router.push(`/hub/handbook/${hit.id}`) }),
    );
    const news = pagesOnly
      ? []
      : (search.data?.posts ?? []).slice(0, 4).map(
          (hit): Row => ({ key: `post-${hit.id}`, group: "news", label: hit.title, detail: hit.context, run: () => router.push(`/hub/news/${hit.id}`) }),
        );
    return [...pages, ...news, { key: "ask", group: "ask", label: t("ask.askRow", { text: term }), run: ask }];
  }, [term, search.data, pagesOnly, router, t, ask]);

  const runRow = (row: Row) => {
    setOpen(false);
    setActive(-1);
    row.run();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown" && rows.length > 0) {
      event.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % rows.length);
      return;
    }
    if (event.key === "ArrowUp" && rows.length > 0) {
      event.preventDefault();
      setActive((i) => (i <= 0 ? rows.length - 1 : i - 1));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (active >= 0 && rows[active]) runRow(rows[active]);
      else if (term) ask();
    }
  };

  const groups: { id: Row["group"]; label: string }[] = [
    { id: "pages", label: t("ask.groups.pages") },
    { id: "news", label: t("ask.groups.news") },
    { id: "ask", label: t("ask.groups.ask") },
  ];
  const found = rows.some((r) => r.group !== "ask");

  return (
    <div ref={root} className={cn("relative", className)}>
      <div className="flex h-14 items-center gap-3 rounded-ai-box border border-divider bg-card pr-2 pl-[18px] shadow-card focus-within:border-accent">
        <Icon icon={SparklesIcon} size="md" className="shrink-0 text-accent" />
        <input
          value={text}
          role="combobox"
          aria-label={placeholder}
          aria-expanded={open && rows.length > 0}
          aria-controls={listId}
          aria-activedescendant={active >= 0 && rows[active] ? `${listId}-${rows[active].key}` : undefined}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setText(event.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          className="min-w-0 flex-1 bg-transparent text-body text-primary outline-none placeholder:text-tertiary"
        />
        <button
          type="button"
          aria-label={t("ask.send")}
          onClick={() => {
            if (active >= 0 && rows[active]) runRow(rows[active]);
            else if (term) ask();
          }}
          className="flex size-10 shrink-0 items-center justify-center rounded-tint bg-accent text-on-accent hover:bg-accent-hover"
        >
          <Icon icon={ArrowUp02Icon} size="md" />
        </button>
      </div>
      {open && term.length >= 2 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute top-full right-0 left-0 z-30 mt-2 flex max-h-[360px] flex-col gap-1 overflow-y-auto rounded-popover border border-divider bg-overlay p-2 shadow-popover"
        >
          {!found && !search.isFetching && <li className="px-2 py-1 text-label text-tertiary">{t("ask.noResults", { text: term })}</li>}
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
                        className={cn("flex cursor-pointer items-center gap-2.5 rounded-control px-2 py-1.5 text-body", index === active ? "bg-subtle" : "hover:bg-subtle")}
                      >
                        <Icon
                          icon={row.group === "pages" ? File01Icon : row.group === "news" ? Megaphone01Icon : SparklesIcon}
                          size="sm"
                          className={row.group === "ask" ? "text-accent" : "text-tertiary"}
                        />
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
