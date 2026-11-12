"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight02Icon, Bookmark02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { NodRing } from "@/components/desact/nod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/desact/popover";
import { Illustration } from "@/components/illustrations";
import { ErrorState } from "@/components/feedback/ErrorState";
import type { FeedScope, SectionCard, Waiting } from "@/models/hub";
import { cn } from "@/lib/cn";
import { useSavedItems } from "../hooks";
import { capCount, hubIcon, IconTile, POST_TYPE_ICONS, useHubDates } from "../shared";

const FEED_SCOPE_KEY = "hub.feedScope";

/** For me / Everyone, kept for the person (Q-13: "the reader's last choice is kept"). Everyone until they choose. */
export const useFeedScope = (): [FeedScope, (next: FeedScope) => void] => {
  const [scope, setScope] = React.useState<FeedScope>("ALL");
  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(FEED_SCOPE_KEY);
      if (stored === "FOR_ME" || stored === "ALL") setScope(stored);
    } catch {
      // Storage refused: the default stands.
    }
  }, []);
  const change = React.useCallback((next: FeedScope) => {
    setScope(next);
    try {
      window.localStorage.setItem(FEED_SCOPE_KEY, next);
    } catch {
      // Not remembered, still applied.
    }
  }, []);
  return [scope, change];
};

/**
 * "Pages need your yes" (`AgreeCallout`, CH01): a pill on `accent-muted` with an accent counter, the label and an
 * arrow, then "Nearest by {date}". Shown only while at least one page waits for the reader.
 */
export const AgreeCallout: React.FC<{ waiting: Waiting }> = ({ waiting }) => {
  const t = useTranslations("hub");
  const dates = useHubDates();
  if (waiting.count <= 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Link
        href="/hub/to-agree"
        className="inline-flex h-9 items-center gap-2 rounded-pill border border-transparent bg-accent-muted pr-3 pl-1.5 text-label text-accent-text no-underline transition-colors hover:border-accent-ring"
      >
        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-pill bg-accent px-1.5 text-hint font-semibold text-on-accent tabular-nums">
          {capCount(waiting.count)}
        </span>
        {t("home.agreeButton")}
        <Icon icon={ArrowRight02Icon} size="sm" />
      </Link>
      {waiting.nearestDue && <span className="text-hint text-tertiary">{t("home.agreeHint", { date: dates.short(waiting.nearestDue) })}</span>}
    </div>
  );
};

/** "Saved · {n}": a popover 360 wide of saved posts and pages, newest first; no "See all" (CH01 Actions). */
export const SavedPopover: React.FC<{ count: number }> = ({ count }) => {
  const t = useTranslations("hub");
  const dates = useHubDates();
  const [open, setOpen] = React.useState(false);
  const saved = useSavedItems(open);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" className="gap-1.5">
          <Icon icon={Bookmark02Icon} size="sm" />
          {count > 0 ? t("home.savedCount", { count }) : t("home.saved")}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-2">
        <p className="px-2 pt-1 pb-2 text-card-title text-primary">{t("home.saved")}</p>
        {saved.isLoading ? (
          <div className="flex justify-center py-6">
            <NodRing />
          </div>
        ) : saved.isError ? (
          <ErrorState compact error={saved.error} onRetry={() => void saved.refetch()} />
        ) : (saved.data ?? []).length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
            <Illustration scene="no-results-s" size="s" />
            <p className="text-body font-medium text-primary">{t("home.savedEmptyTitle")}</p>
            <p className="text-body text-tertiary">{t("home.savedEmptyLine")}</p>
          </div>
        ) : (
          <ul className="flex max-h-[360px] flex-col overflow-y-auto">
            {(saved.data ?? []).map((item) => (
              <li key={`${item.type}-${item.id}`}>
                <Link
                  href={item.type === "POST" ? `/hub/news/${item.id}` : `/hub/handbook/${item.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-control px-2 py-2 no-underline hover:bg-subtle"
                >
                  <IconTile
                    icon={item.type === "POST" ? POST_TYPE_ICONS.ANNOUNCEMENT : hubIcon(item.icon)}
                    color={item.color}
                    mist={item.type === "POST"}
                    size={32}
                  />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-body font-medium text-primary">{item.title}</span>
                    <span className="truncate text-hint text-tertiary">
                      {t("home.savedMeta", { context: item.context ?? t("home.news"), date: dates.short(item.date) })}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
};

/** A section on CH01's grid (`HandbookSectionCard`): its tile, name, "{n} pages" and what waits for the reader. */
export const HandbookSectionCard: React.FC<{ section: SectionCard }> = ({ section }) => {
  const t = useTranslations("hub");
  const waits = section.toAgree > 0;
  return (
    <Link
      href={`/hub/handbook#section-${section.id}`}
      className="flex h-14 items-center gap-3 rounded-card bg-mist px-3 no-underline transition-colors hover:bg-divider"
    >
      <IconTile icon={hubIcon(section.icon)} color={section.color} size={32} dot={waits} />
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-body font-medium text-primary">{section.name}</span>
        <span className="truncate text-hint text-tertiary">
          {t("handbook.pages", { count: section.pageCount })}
          {waits && <span className="text-accent-text">{t("handbook.toAgreeSuffix", { count: section.toAgree })}</span>}
        </span>
      </span>
    </Link>
  );
};

/** The six section cards: those with pages waiting for the reader first, then the editor's order. */
export const orderSectionCards = (sections: SectionCard[]): SectionCard[] =>
  [...sections.filter((s) => s.toAgree > 0), ...sections.filter((s) => s.toAgree <= 0)].slice(0, 6);

export const SectionLinkArrow: React.FC<{ href: string; children: React.ReactNode; className?: string }> = ({ href, children, className }) => (
  <Link href={href} className={cn("inline-flex items-center gap-1 text-label text-accent-text no-underline hover:underline", className)}>
    {children}
  </Link>
);
