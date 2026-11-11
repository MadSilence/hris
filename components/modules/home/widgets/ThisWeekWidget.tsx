"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/desact/tooltip";
import { cn } from "@/lib/cn";
import { useShortDates } from "@/lib/date";
import type { Celebration } from "@/models/home";
import { useCelebrations } from "@/components/modules/home/hooks";
import {
  PersonFace,
  WidgetCard,
  WidgetEmpty,
  WidgetError,
  WidgetScroll,
  WidgetSkeleton,
  fullName,
} from "@/components/modules/home/components/WidgetCard";
import type { HomeWidgetProps } from "./catalogue";

type HomeT = ReturnType<typeof useTranslations<"home">>;

const nameOf = (item: Celebration, t: HomeT) => fullName(item.firstName, item.lastName) || t("card.unnamed");
const firstOf = (item: Celebration, t: HomeT) => item.firstName?.trim() || nameOf(item, t);

/** The sentence about one person today: "Marta's birthday is today", "Ana joins today", "Tomas: 5 years at the company today". */
const todaySentence = (item: Celebration, t: HomeT) =>
  item.kind === "BIRTHDAY"
    ? t("thisWeek.birthdayToday", { name: firstOf(item, t) })
    : item.kind === "NEW_JOINER"
      ? t("thisWeek.joinsToday", { name: firstOf(item, t) })
      : t("thisWeek.anniversaryToday", { name: firstOf(item, t), count: item.years ?? 1 });

/** What a row says: "birthday", "5 years", "joins" — never "joined", never a birth year. */
const what = (item: Celebration, t: HomeT) =>
  item.kind === "BIRTHDAY" ? t("thisWeek.birthday") : item.kind === "NEW_JOINER" ? t("thisWeek.joins") : t("thisWeek.years", { count: item.years ?? 1 });

/**
 * Confetti in the corner, only when someone celebrates today: the big ring, the dots and the stick in the company
 * accent, the small ring in Ink, the triangle a light tint of the accent. Decoration — hidden from readers.
 */
const Confetti: React.FC = () => (
  <svg width="64" height="56" viewBox="0 0 64 56" fill="none" aria-hidden className="pointer-events-none absolute top-3 right-4">
    <circle cx="44" cy="20" r="8" className="stroke-accent" strokeWidth="3.5" />
    <circle cx="60" cy="40" r="3" className="stroke-primary" strokeWidth="2" />
    <circle cx="14" cy="10" r="2.5" className="fill-accent" />
    <circle cx="28" cy="44" r="2" className="fill-accent" />
    <path d="M6 30 L12 28" className="stroke-accent" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M24 4 L30 12 L20 12 Z" className="fill-accent-muted" />
  </svg>
);

/** A row of what is coming: face, name, what, and the day in the accent ("Thu 12"). */
const Row: React.FC<{ item: Celebration; isToday: boolean; preview?: boolean; face?: 22 | 28 }> = ({ item, isToday, preview, face = 28 }) => {
  const t = useTranslations("home");
  const dates = useShortDates();
  const name = nameOf(item, t);
  return (
    <li>
      <Link
        href={`/organization/people/${item.userId}/personal`}
        tabIndex={preview ? -1 : undefined}
        className="-mx-2 flex items-center gap-2.5 rounded-control px-2 py-1.5 hover:bg-subtle"
      >
        <PersonFace name={name} avatarUrl={item.avatarUrl} size={face} />
        <span className="min-w-0 flex-1 truncate text-body">
          <span className="font-medium text-primary">{firstOf(item, t)}</span>
          <span className="text-tertiary">{t("thisWeek.rowWhat", { what: what(item, t) })}</span>
        </span>
        <span className="shrink-0 text-label text-accent-text">
          {isToday ? t("card.today") : dates.date(item.date, { weekday: true })}
        </span>
      </Link>
    </li>
  );
};

/** Faces, at most three, then "+N"; hovering lists everyone. */
const Faces: React.FC<{ items: Celebration[]; label: string }> = ({ items, label }) => {
  const t = useTranslations("home");
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="flex items-center -space-x-1.5" tabIndex={0}>
          {items.slice(0, 3).map((item) => (
            <PersonFace key={`${item.kind}-${item.userId}`} name={nameOf(item, t)} avatarUrl={item.avatarUrl} size={28} />
          ))}
          {items.length > 3 && (
            <span className="z-10 flex size-7 items-center justify-center rounded-pill bg-mist text-hint font-semibold text-secondary ring-2 ring-card">
              {t("thisWeek.more", { count: items.length - 3 })}
            </span>
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent title={label}>
        {items.map((item) => (
          <span key={`${item.kind}-${item.userId}`} className="block">{t("thisWeek.listLine", { name: nameOf(item, t), what: what(item, t) })}</span>
        ))}
      </TooltipContent>
    </Tooltip>
  );
};

/**
 * Birthdays, work anniversaries and new joiners this week (`home-widgets` § 6): today first, then the rest of the week
 * by date. **No buttons** — the card only tells; a person opens their profile. Birthdays are only of people who chose
 * to show theirs, and never with a year — both the server's rule.
 */
export const ThisWeekWidget: React.FC<HomeWidgetProps> = ({ size, preview }) => {
  const t = useTranslations("home");
  const query = useCelebrations(true);
  const title = t("widgets.thisWeek.title");

  if (query.isLoading) {
    return (
      <WidgetCard title={title} size={size}>
        <WidgetSkeleton rows={size === "S" ? 1 : 3} />
      </WidgetCard>
    );
  }
  if (query.error || !query.data) {
    return (
      <WidgetCard title={title} size={size}>
        <WidgetError size={size} message={t("card.couldNotLoad", { thing: "celebrations" })} onRetry={() => void query.refetch()} />
      </WidgetCard>
    );
  }

  const day = query.data.from;
  const today = query.data.items.filter((item) => item.date === day);
  const later = query.data.items.filter((item) => item.date !== day);
  const confetti = today.length > 0 && <Confetti />;

  if (query.data.items.length === 0) {
    if (size === "S") {
      return (
        <WidgetCard title={title} size={size}>
          <p className="mt-auto text-body text-tertiary">{t("thisWeek.nothingWeek")}</p>
        </WidgetCard>
      );
    }
    return (
      <WidgetCard title={title} size={size}>
        <WidgetEmpty size={size} scene="celebrations" title={t("thisWeek.emptyTitle")} line={t("thisWeek.emptyLine")} />
      </WidgetCard>
    );
  }

  const allBirthdays = today.every((item) => item.kind === "BIRTHDAY");
  const manyLabel = allBirthdays
    ? t("thisWeek.birthdaysToday", { count: today.length })
    : t("thisWeek.celebrationsToday", { count: today.length });
  const laterList = (face: 22 | 28 = 28) => (
    <ul className="flex flex-col">{later.map((item) => <Row key={`${item.kind}-${item.userId}`} item={item} isToday={false} preview={preview} face={face} />)}</ul>
  );

  // Nobody today.
  if (today.length === 0) {
    if (size === "S") {
      return (
        <WidgetCard title={title} size={size}>
          <p className="text-hint text-tertiary">{t("thisWeek.nothingTodayComing")}</p>
          <ul className="flex flex-col">
            {later.slice(0, 2).map((item) => <Row key={`${item.kind}-${item.userId}`} item={item} isToday={false} preview={preview} face={22} />)}
          </ul>
        </WidgetCard>
      );
    }
    return (
      <WidgetCard title={title} size={size}>
        <div className={cn(size === "L" ? "grid min-h-0 flex-1 grid-cols-2 gap-6" : "flex min-h-0 flex-1 flex-col gap-3")}>
          <div className="flex flex-col gap-1">
            <p className="text-body text-secondary">{t("thisWeek.nothingToday")}</p>
            {size === "L" && <p className="text-label text-accent-text">{t("thisWeek.comingUp")}</p>}
          </div>
          <div className={cn("flex min-h-0 flex-col gap-1", size === "M" && "border-t border-divider pt-3")}>
            <p className="text-hint font-semibold text-tertiary">{t("thisWeek.laterThisWeek")}</p>
            <WidgetScroll>{laterList()}</WidgetScroll>
          </div>
        </div>
      </WidgetCard>
    );
  }

  // Someone today.
  const many = size === "L" ? today.length >= 4 : today.length >= 3;
  const hero = today.length === 1 ? today[0] : null;

  const todayBlock = hero ? (
    <Link
      href={`/organization/people/${hero.userId}/personal`}
      tabIndex={preview ? -1 : undefined}
      className={cn("flex min-w-0 gap-3", size === "L" ? "flex-col items-start" : "items-center")}
    >
      <PersonFace name={nameOf(hero, t)} avatarUrl={hero.avatarUrl} size={size === "L" ? 64 : 36} />
      <span
        className={cn(
          "line-clamp-3 text-primary",
          size === "S" ? "text-home-sentence" : size === "M" ? "text-home-sentence-m" : "text-home-sentence-l",
        )}
      >
        {todaySentence(hero, t)}
      </span>
    </Link>
  ) : many ? (
    <div className="flex flex-col gap-2">
      <Faces items={today} label={t("card.today")} />
      <p className={cn("text-primary", size === "L" ? "text-home-sentence-l" : "text-card-title")}>{manyLabel}</p>
    </div>
  ) : (
    <div className="flex flex-col gap-1">
      {size !== "S" && (
        <p className={cn("text-primary", size === "L" ? "text-home-sentence-l" : "text-label")}>
          {/* Two (three in Large) say "celebrations"; "birthdays" is the many-faces label's alone (`home-widgets` § 6). */}
          {t("thisWeek.celebrationsToday", { count: today.length })}
        </p>
      )}
      <ul className={cn("flex flex-col", size !== "S" && "rounded-tint bg-accent-subtle px-2 py-1")}>
        {today.map((item) => <Row key={`${item.kind}-${item.userId}`} item={item} isToday preview={preview} face={22} />)}
      </ul>
    </div>
  );

  if (size === "S") {
    return (
      <WidgetCard title={title} size={size}>
        {confetti}
        {todayBlock}
        {later.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0} className="mt-auto w-fit text-hint text-tertiary underline decoration-dotted underline-offset-4">
                {t("thisWeek.moreThisWeek", { count: later.length })}
              </span>
            </TooltipTrigger>
            <TooltipContent title={t("thisWeek.laterThisWeek")}>
              {later.map((item) => (
                <span key={`${item.kind}-${item.userId}`} className="block">{t("thisWeek.listLine", { name: nameOf(item, t), what: what(item, t) })}</span>
              ))}
            </TooltipContent>
          </Tooltip>
        )}
      </WidgetCard>
    );
  }

  return (
    <WidgetCard title={title} size={size}>
      {confetti}
      <div className={cn(size === "L" ? "grid min-h-0 flex-1 grid-cols-2 gap-6" : "flex min-h-0 flex-1 flex-col gap-3")}>
        {todayBlock}
        {later.length > 0 && (
          <div className={cn("flex min-h-0 flex-col gap-1", size === "M" ? "border-t border-divider pt-3" : "border-l border-divider pl-6")}>
            <p className="text-hint font-semibold text-tertiary">{t("thisWeek.laterThisWeek")}</p>
            <WidgetScroll>{laterList()}</WidgetScroll>
          </div>
        )}
      </div>
    </WidgetCard>
  );
};
