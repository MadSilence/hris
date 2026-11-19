"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/desact/tooltip";
import { cn } from "@/lib/cn";
import { useShortDates } from "@/lib/date";
import type { Celebration } from "@/models/home";
import { useCelebrations } from "@/components/modules/home/hooks";
import { useCompanyData } from "@/components/providers/CompanyDataProvider/CompanyDataProvider";
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
 * Confetti in the corner, only when someone celebrates today — the designers' drawing exactly (fix T2): the big ring in
 * the accent, the small ring in Ink, the dot and the stick in the second accent, the triangle a light tint of the
 * accent (`--confetti-2`, `--confetti-light` in styles/globals.css). Decoration — hidden from readers.
 */
const Confetti: React.FC = () => (
  <svg viewBox="0 0 200 110" fill="none" aria-hidden className="pointer-events-none absolute -top-1 -right-2 h-[88px] w-[160px]">
    <circle cx="150" cy="30" r="11" fill="none" stroke="var(--accent)" strokeWidth="5" />
    <circle cx="186" cy="74" r="4.5" fill="none" stroke="var(--ink)" strokeWidth="3" />
    <circle cx="108" cy="16" r="4" fill="var(--confetti-2)" />
    <rect x="170" y="8" width="12" height="4.5" rx="2.25" fill="var(--confetti-2)" transform="rotate(-30 176 10)" />
    <path d="M160 92l5 8h-10z" fill="var(--confetti-light)" />
  </svg>
);

/**
 * Whether today's people show as faces and a count rather than by name (the board LW06, "Three today": Small and
 * Medium name up to two people, Large up to three — T10–T12). Small with three today once listed all three and hid
 * the rest of the week (walk of 2026-11-19).
 */
export const showsFacesToday = (size: "S" | "M" | "L", todayCount: number): boolean =>
  todayCount >= (size === "L" ? 4 : 3);

const WEEKDAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

/**
 * The last day of the company's week that holds `today` (both ISO dates), from the company's first day of the week
 * (`weekStartDay`, Monday unless the company says otherwise) — "Later this week" never reaches into the next one (H4).
 */
export const lastDayOfWeek = (today: string, weekStartDay: string | null | undefined): string => {
  const start = Math.max(0, WEEKDAYS.indexOf((weekStartDay ?? "MONDAY").toUpperCase()));
  const date = new Date(`${today}T00:00:00Z`);
  const toEnd = (start + 6 - date.getUTCDay() + 7) % 7;
  date.setUTCDate(date.getUTCDate() + toEnd);
  return date.toISOString().slice(0, 10);
};

const keyOf = (item: Celebration) => `${item.kind}-${item.userId}`;
const profileOf = (item: Celebration) => `/organization/people/${item.userId}/personal`;

/**
 * A row of what is coming (the designers' widgets fixes T6, T8, T13), its day in the accent as the week names it
 * ("Thu", "Thu 12" in Large — A6):
 * - `s` — 22 high: avatar 22, 8, "Tomas" 13/22 500 + "5 years" tertiary, no "·"; the day 12/22.
 * - `m` — 32 high (padding 4 0): avatar 24, 8, "Tomas" 13/22 500 + "· 5 years" tertiary; the day 13/22.
 * - `l` — 34 high, two lines: avatar 28, 10, the name 13/17 500 over what 12/17 tertiary; the day 12/20.
 */
const Row: React.FC<{ item: Celebration; variant: "s" | "m" | "l"; preview?: boolean }> = ({ item, variant, preview }) => {
  const t = useTranslations("home");
  const dates = useShortDates();
  const name = nameOf(item, t);
  const day = dates.day(item.date, { withDay: variant === "l", hideYear: true });
  return (
    <li>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={profileOf(item)}
            tabIndex={preview ? -1 : undefined}
            className={cn(
              "-mx-2 flex min-w-0 items-center rounded-control px-2 hover:bg-subtle",
              variant === "s" && "h-[22px] gap-2",
              variant === "m" && "h-8 gap-2 py-1",
              variant === "l" && "h-[34px] gap-2.5",
            )}
          >
            <PersonFace name={name} avatarUrl={item.avatarUrl} size={variant === "s" ? 22 : variant === "m" ? 24 : 28} />
            {variant === "l" ? (
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-label leading-[17px] text-primary">{firstOf(item, t)}</span>
                <span className="truncate text-hint leading-[17px] text-tertiary">{what(item, t)}</span>
              </span>
            ) : (
              <span className="min-w-0 flex-1 truncate text-label leading-[22px] font-normal">
                <span className="font-medium text-primary">{firstOf(item, t)}</span>
                <span className="text-tertiary">
                  {variant === "s" ? t("thisWeek.rowWhatPlain", { what: what(item, t) }) : t("thisWeek.rowWhat", { what: what(item, t) })}
                </span>
              </span>
            )}
            <span
              className={cn(
                "flex-none font-medium text-accent-text",
                variant === "m" ? "text-label leading-[22px]" : variant === "s" ? "text-hint leading-[22px]" : "text-hint leading-5",
              )}
            >
              {day}
            </span>
          </Link>
        </TooltipTrigger>
        {/* A row cut with … keeps its whole text in a tooltip (T17). */}
        <TooltipContent title={name}>{what(item, t)}</TooltipContent>
      </Tooltip>
    </li>
  );
};

/** Everyone in a tooltip: "Marta · birthday" a line each, under its title. */
const ListTooltip: React.FC<{ items: Celebration[]; title: string; withDay?: boolean }> = ({ items, title, withDay }) => {
  const t = useTranslations("home");
  const dates = useShortDates();
  return (
    <TooltipContent title={title}>
      {items.map((item) => (
        <span key={keyOf(item)} className="flex gap-3">
          <span className="flex-1">{t("thisWeek.listLine", { name: nameOf(item, t), what: what(item, t) })}</span>
          {withDay && <span className="text-accent-text">{dates.day(item.date, { hideYear: true })}</span>}
        </span>
      ))}
    </TooltipContent>
  );
};

/**
 * Faces, at most three, then "+N" — a circle of the faces' size on the grey fill; hovering lists everyone under "Today"
 * (T10–T12). Every face has its white ring where they overlap.
 */
const Faces: React.FC<{ items: Celebration[]; label: string; size: 22 | 28 | 32 | 48 }> = ({ items, label, size }) => {
  const t = useTranslations("home");
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={"flex shrink-0 items-center -space-x-2"} tabIndex={0}>
          {items.slice(0, 3).map((item) => (
            <PersonFace key={keyOf(item)} name={nameOf(item, t)} avatarUrl={item.avatarUrl} size={size} />
          ))}
          {items.length > 3 && (
            // "+N" sizes its digits as the faces' initials (A1: 32 → 11, 48 → 15), the container's own — at 48 it was 11.
            <span
              className={cn(
                "@container z-10 flex items-center justify-center rounded-pill bg-mist text-secondary ring-2 ring-card",
                size === 22 && "size-[22px]",
                size === 28 && "size-7",
                size === 32 && "size-8",
                size === 48 && "size-12",
              )}
            >
              <span className="text-initials">{t("thisWeek.more", { count: items.length - 3 })}</span>
            </span>
          )}
        </span>
      </TooltipTrigger>
      <ListTooltip items={items} title={label} />
    </Tooltip>
  );
};

/** "+3 more this week" with the next faces before it (T4, T15); hovering lists the rest of the week with its days. */
const MoreThisWeek: React.FC<{ later: Celebration[]; faces?: boolean; ink?: boolean }> = ({ later, faces = true, ink }) => {
  const t = useTranslations("home");
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} className="flex w-fit min-w-0 items-center gap-2">
          {faces && (
            <span className="flex shrink-0 -space-x-2">
              {later.slice(0, 3).map((item) => (
                <PersonFace key={keyOf(item)} name={nameOf(item, t)} avatarUrl={item.avatarUrl} size={22} />
              ))}
            </span>
          )}
          <span
            className={cn(
              "truncate text-hint underline decoration-dotted underline-offset-4",
              ink ? "text-primary" : "leading-5 text-secondary",
            )}
          >
            {t("thisWeek.moreThisWeek", { count: later.length })}
          </span>
        </span>
      </TooltipTrigger>
      <ListTooltip items={later} title={t("thisWeek.laterThisWeek")} withDay />
    </Tooltip>
  );
};

/**
 * Birthdays, work anniversaries and new joiners this week (`home-widgets` § 6): today first, then the rest of the week
 * by date. **No buttons** — the card only tells; a person opens their profile. Birthdays are only of people who chose
 * to show theirs, and never with a year — both the server's rule. Every state is drawn as the designers' widgets fixes
 * T4–T17 give it: Large is two columns with a hairline between them, its left one sitting at the bottom.
 */
export const ThisWeekWidget: React.FC<HomeWidgetProps> = ({ size, preview }) => {
  const t = useTranslations("home");
  const query = useCelebrations(true);
  const { company } = useCompanyData();
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
  // The read is the next seven days; the widget is this week, to the company's last day of it (H4).
  const weekEnd = lastDayOfWeek(day, company?.weekStartDay);
  const items = query.data.items.filter((item) => item.date <= weekEnd);
  const today = items.filter((item) => item.date === day);
  const later = items.filter((item) => item.date !== day);
  const confetti = today.length > 0 && <Confetti />;

  if (items.length === 0) {
    if (size === "S") {
      return (
        <WidgetCard title={title} size={size}>
          <p className="mt-auto text-label font-normal text-secondary">{t("thisWeek.nothingWeek")}</p>
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
  const laterLabel = (large: boolean) => (
    <p className={cn("text-hint font-medium text-tertiary", large && "leading-5")}>{t("thisWeek.laterThisWeek")}</p>
  );
  const laterList = (variant: "m" | "l") => (
    <ul className={cn("flex flex-col", variant === "m" ? "gap-1.5" : "gap-3")}>
      {later.map((item) => (
        <Row key={keyOf(item)} item={item} variant={variant} preview={preview} />
      ))}
    </ul>
  );
  /** Large: the left column 218 wide at the bottom, a hairline with 24 on each side, the week on the right (T6, T14). */
  const large = (left: React.ReactNode) => (
    <div className="flex min-h-0 flex-1 gap-6">
      <div className="flex w-[218px] shrink-0 flex-col justify-end">{left}</div>
      <span aria-hidden className="w-px shrink-0 bg-divider" />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2.5">
        {laterLabel(true)}
        {later.length > 0 && <WidgetScroll>{laterList("l")}</WidgetScroll>}
      </div>
    </div>
  );
  /** Medium: what today holds, a full-width hairline, 12, "Later this week", 12, the rows (T5, T8). */
  const medium = (top: React.ReactNode) => (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {top}
      {later.length > 0 && (
        <div className="flex min-h-0 flex-col gap-3 border-t border-divider pt-3">
          {laterLabel(false)}
          <WidgetScroll>{laterList("m")}</WidgetScroll>
        </div>
      )}
    </div>
  );

  // Nobody today.
  if (today.length === 0) {
    if (size === "S") {
      return (
        <WidgetCard title={title} size={size} className="gap-3">
          <p className="text-hint text-tertiary">{t("thisWeek.nothingTodayComing")}</p>
          <ul className="flex flex-col gap-1.5">
            {later.slice(0, 2).map((item) => (
              <Row key={keyOf(item)} item={item} variant="s" preview={preview} />
            ))}
          </ul>
        </WidgetCard>
      );
    }
    if (size === "L") {
      return (
        <WidgetCard title={title} size={size}>
          {large(
            <div className="flex flex-col gap-1.5">
              <p className="line-clamp-2 text-widget-title leading-6 text-secondary">{t("thisWeek.nothingToday")}</p>
              <p className="flex items-center gap-1 text-label font-normal text-tertiary">
                {t("thisWeek.comingUp")}
                <Icon icon={ArrowRight01Icon} size="sm" />
              </p>
            </div>,
          )}
        </WidgetCard>
      );
    }
    return (
      <WidgetCard title={title} size={size}>
        {medium(<p className="text-body text-secondary">{t("thisWeek.nothingToday")}</p>)}
      </WidgetCard>
    );
  }

  const hero = today.length === 1 ? today[0] : null;
  const many = showsFacesToday(size, today.length);

  if (size === "S") {
    if (hero) {
      // T4: gap 12, a spacer, the row (avatar 36, the sentence in a 168 column, two lines), then faces + "+3 more".
      return (
        <WidgetCard title={title} size={size} className="gap-3">
          {confetti}
          <span className="flex-1" />
          <Link href={profileOf(hero)} tabIndex={preview ? -1 : undefined} className="flex min-w-0 items-center gap-2.5">
            <PersonFace name={nameOf(hero, t)} avatarUrl={hero.avatarUrl} size={36} />
            <span className="line-clamp-2 w-[168px] text-home-sentence leading-5 font-medium break-words text-primary">
              {todaySentence(hero, t)}
            </span>
          </Link>
          {later.length > 0 && <MoreThisWeek later={later} />}
        </WidgetCard>
      );
    }
    if (many) {
      // T10: faces 32 and the count beside them, then "+5 more this week" in Ink.
      return (
        <WidgetCard title={title} size={size} className="gap-3">
          {confetti}
          <div className="mt-auto flex flex-col gap-1">
            <div className="flex min-w-0 items-center gap-2.5">
              <Faces items={today} label={t("card.today")} size={32} />
              <span className="line-clamp-2 text-home-sentence leading-5 font-medium text-primary">{manyLabel}</span>
            </div>
            {later.length > 0 && <MoreThisWeek later={later} faces={false} ink />}
          </div>
        </WidgetCard>
      );
    }
    return (
      <WidgetCard title={title} size={size} className="gap-3">
        {confetti}
        <ul className="flex flex-col gap-1.5">
          {today.map((item) => (
            <TodayRowS key={keyOf(item)} item={item} preview={preview} />
          ))}
        </ul>
        {today.length <= 2 && later.length > 0 && <div className="mt-auto"><MoreThisWeek later={later} /></div>}
      </WidgetCard>
    );
  }

  if (size === "M") {
    let top: React.ReactNode;
    if (hero) {
      // T5: avatar 44, 10, the sentence Inter Tight 19/23 500.
      top = (
        <Link href={profileOf(hero)} tabIndex={preview ? -1 : undefined} className="flex min-w-0 items-center gap-2.5">
          <PersonFace name={nameOf(hero, t)} avatarUrl={hero.avatarUrl} size={44} />
          <span className="line-clamp-2 text-home-sentence-m leading-[23px] font-medium break-words text-primary">{todaySentence(hero, t)}</span>
        </Link>
      );
    } else if (many) {
      // T11: "Today", then faces 28 + "5 celebrations".
      top = (
        <div className="flex flex-col gap-2">
          <p className="text-hint font-medium text-tertiary">{t("card.today")}</p>
          <div className="flex min-w-0 items-center gap-2.5">
            <Faces items={today} label={t("card.today")} size={28} />
            <span className="truncate text-body font-medium text-primary">
              {allBirthdays ? t("thisWeek.birthdaysCount", { count: today.length }) : t("thisWeek.celebrationsCount", { count: today.length })}
            </span>
          </div>
        </div>
      );
    } else {
      // T7: the label, then a pill per person.
      top = (
        <div className="flex flex-col gap-2">
          <p className="text-hint font-medium text-tertiary">{t("thisWeek.celebrationsToday", { count: today.length })}</p>
          <ul className="flex flex-col gap-1.5">
            {today.map((item) => (
              <li key={keyOf(item)}>
                <Link
                  href={profileOf(item)}
                  tabIndex={preview ? -1 : undefined}
                  className="flex h-[34px] min-w-0 items-center gap-2 rounded-tint bg-accent-subtle py-[5px] pr-2.5 pl-1.5"
                >
                  <PersonFace name={nameOf(item, t)} avatarUrl={item.avatarUrl} size={24} />
                  <span className="min-w-0 flex-1 truncate text-label leading-[22px] font-normal">
                    <span className="font-medium text-primary">{firstOf(item, t)}</span>
                    <span className="text-tertiary">{t("thisWeek.rowWhat", { what: what(item, t) })}</span>
                  </span>
                  <span className="flex-none text-label leading-[22px] text-accent-text">{t("card.today")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    return (
      <WidgetCard title={title} size={size}>
        {confetti}
        {medium(top)}
      </WidgetCard>
    );
  }

  // Large.
  let left: React.ReactNode;
  if (hero) {
    // T6: avatar 64, 10, the sentence Inter Tight 24/28 500.
    left = (
      <Link href={profileOf(hero)} tabIndex={preview ? -1 : undefined} className="flex min-w-0 flex-col items-start gap-2.5">
        <PersonFace name={nameOf(hero, t)} avatarUrl={hero.avatarUrl} size={64} />
        <span className="line-clamp-3 text-home-sentence-l font-medium tracking-[-0.02em] break-words text-primary">{todaySentence(hero, t)}</span>
      </Link>
    );
  } else if (many) {
    // T12: faces 48 + "5 celebrations today".
    left = (
      <div className="flex min-w-0 flex-col items-start gap-2.5">
        <Faces items={today} label={t("card.today")} size={48} />
        <span className="text-home-sentence-l font-medium tracking-[-0.02em] text-primary">{manyLabel}</span>
      </div>
    );
  } else {
    // T9: the count, 12, a pill per person — no "·", no "Today".
    left = (
      <div className="flex min-w-0 flex-col gap-3">
        <p className="text-home-sentence-l font-medium tracking-[-0.02em] text-primary">
          {t("thisWeek.celebrationsToday", { count: today.length })}
        </p>
        <ul className="flex flex-col gap-1.5">
          {today.slice(0, 3).map((item) => (
            <li key={keyOf(item)}>
              <Link
                href={profileOf(item)}
                tabIndex={preview ? -1 : undefined}
                className="flex h-11 min-w-0 items-center gap-2.5 rounded-tint bg-accent-subtle py-1.5 pr-3 pl-1.5"
              >
                <PersonFace name={nameOf(item, t)} avatarUrl={item.avatarUrl} size={32} />
                <span className="min-w-0 flex-1 truncate text-body">
                  <span className="font-medium text-primary">{firstOf(item, t)}</span>{" "}
                  <span className="text-tertiary">{what(item, t)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <WidgetCard title={title} size={size}>
      {confetti}
      {large(left)}
    </WidgetCard>
  );
};

/** Small, two or three today: a row each — avatar 22, the name, what, "Today" in the accent. */
const TodayRowS: React.FC<{ item: Celebration; preview?: boolean }> = ({ item, preview }) => {
  const t = useTranslations("home");
  return (
    <li>
      <Link
        href={profileOf(item)}
        tabIndex={preview ? -1 : undefined}
        className="-mx-2 flex h-[22px] min-w-0 items-center gap-2 rounded-control px-2 hover:bg-subtle"
      >
        <PersonFace name={nameOf(item, t)} avatarUrl={item.avatarUrl} size={22} />
        <span className="min-w-0 flex-1 truncate text-label leading-[22px] font-normal">
          <span className="font-medium text-primary">{firstOf(item, t)}</span>
          <span className="text-tertiary">{t("thisWeek.rowWhatPlain", { what: what(item, t) })}</span>
        </span>
        <span className="flex-none text-hint leading-[22px] font-medium text-accent-text">{t("card.today")}</span>
      </Link>
    </li>
  );
};
