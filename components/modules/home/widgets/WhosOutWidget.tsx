"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/desact/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/desact/tooltip";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { cn } from "@/lib/cn";
import { useDisplayLocale, useShortDates, useWeekStartsOn } from "@/lib/date";
import { TAG_CLASSES, toTagColor } from "@/lib/theme/tags";
import type { WhosOutAudience, WhosOutPerson } from "@/models/home";
import { useWhosOut } from "@/components/modules/home/hooks";
import {
  PersonFace,
  SmallFooter,
  TWO_LINE_ROW,
  WidgetCard,
  WidgetEmpty,
  WidgetError,
  WidgetLink,
  WidgetScroll,
  WidgetSkeleton,
  fullName,
} from "@/components/modules/home/components/WidgetCard";
import type { HomeWidgetProps } from "./catalogue";

const PENDING = new Set(["PENDING", "CANCELLATION_PENDING"]);
const AUDIENCE_KEY = "home.whosOut.audience";

/**
 * My team / Everyone, remembered for this person in this browser (a per-viewer convenience); Small follows the last
 * choice made in Medium or Large. Storage can be missing or refuse — then it is just not remembered.
 */
const useAudience = (): [WhosOutAudience, (next: WhosOutAudience) => void] => {
  const [audience, setAudience] = useState<WhosOutAudience>("TEAM");
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(AUDIENCE_KEY);
      if (stored === "TEAM" || stored === "EVERYONE") setAudience(stored);
    } catch {
      // not remembered
    }
  }, []);
  const choose = (next: WhosOutAudience) => {
    setAudience(next);
    try {
      window.localStorage.setItem(AUDIENCE_KEY, next);
    } catch {
      // not remembered
    }
  };
  return [audience, choose];
};

const addDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
/**
 * The five days the lanes draw (A3): the first five of the company's week that holds `iso`, from its first day
 * (0 = Sunday … 6 = Saturday; Monday unless the company says otherwise — the designers' Home fixes, 4.0).
 */
const workWeek = (iso: string, weekStartsOn: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  const first = addDays(iso, -((d.getUTCDay() - weekStartsOn + 7) % 7));
  return [0, 1, 2, 3, 4].map((i) => addDays(first, i));
};

/** The leave type, never the policy (A9): "Vacation", "Sick day"; "Away" for a type the reader may not know. */
/**
 * A day off that is only today reads "today" (O4) — the leave's own first and last working days, never the ones the card
 * cut to its window: out Thursday and Friday still reads "back Mon" on Thursday (walk of 2026-11-19).
 */
export const isOnlyToday = (person: WhosOutPerson, today: string): boolean =>
  person.firstDay === today && (person.lastDay === undefined ? person.endDate : person.lastDay) === today;

const typeOf = (person: WhosOutPerson, away: string) => person.leaveTypeName ?? away;

/**
 * The leave goes on after the week (O6): read from its own last working day — the server cuts `endDate` to the window it
 * was asked for, so a leave to 4 Dec read as ending on Friday, round-ended, with no "back" (walk of 2026-11-19).
 */
export const runsPastWeek = (person: Pick<WhosOutPerson, "endDate" | "lastDay">, friday: string): boolean =>
  (person.lastDay ?? person.endDate) > friday;

/**
 * Lanes for the week (O8): people whose days do not overlap share a row — each person goes into the first row whose
 * last bar ends before theirs starts, in the order they start.
 */
export const packLanes = <T extends { first: number; last: number }>(bars: T[]): T[][] => {
  const rows: T[][] = [];
  for (const bar of [...bars].sort((a, b) => a.first - b.first)) {
    const row = rows.find((r) => r[r.length - 1].last < bar.first);
    if (row) row.push(bar);
    else rows.push([bar]);
  }
  return rows;
};

/** A face on a bar (O5): a white circle with the initials 10/600 in the bar's own ink. */
const LaneFace: React.FC<{ name: string; avatarUrl: string | null; ink: string }> = ({ name, avatarUrl, ink }) => (
  <Avatar className="size-[26px]">
    {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
    <AvatarFallback name={name} className={cn("bg-card text-avatar-xs", ink)}>
      {initialsOf(name)}
    </AvatarFallback>
  </Avatar>
);

const initialsOf = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("") || "?";

/**
 * Who is away (`home-widgets` § 5): today as a count (Small) or a list (Medium), the week as lanes (Large). Pending
 * leave is a dashed edge on white, approved a solid soft fill. What is said about the leave is the server's
 * disclosure rule — a type the reader may not know arrives without a name and reads "Away".
 */
export const WhosOutWidget: React.FC<HomeWidgetProps> = ({ size, preview }) => {
  const t = useTranslations("home");
  const dates = useShortDates();
  const locale = useDisplayLocale();
  const [audience, setAudience] = useAudience();
  const weekStartsOn = useWeekStartsOn();
  const query = useWhosOut(size === "L" ? "WEEK" : "TODAY", audience);
  const title = t("widgets.whosOut.title");
  const away = t("whosOut.away");
  const calendarLink = <WidgetLink href="/calendar">{t("whosOut.calendar")}</WidgetLink>;
  const scope = (
    <SegmentedControl<WhosOutAudience>
      aria-label={t("whosOut.whose")}
      value={audience}
      onChange={setAudience}
      fill={false}
      size="sm"
      options={[
        { value: "TEAM", label: t("whosOut.myTeam") },
        { value: "EVERYONE", label: t("whosOut.everyone") },
      ]}
    />
  );

  if (query.isLoading) {
    return (
      <WidgetCard title={title} size={size}>
        <WidgetSkeleton number={size === "S"} rows={size === "S" ? 0 : 3} />
      </WidgetCard>
    );
  }
  if (query.error || !query.data) {
    return (
      <WidgetCard title={title} size={size}>
        <WidgetError size={size} message={t("card.couldNotLoad", { thing: "whosOut" })} onRetry={() => void query.refetch()} />
      </WidgetCard>
    );
  }

  const data = query.data;
  const today = data.from;
  const people = data.people;
  // O4: "back" is the person's next working day, from the server; this week's day by its weekday ("back Thu"), a later
  // one by its date ("back 4 Jan"). A day off that is only today reads "today".
  const back = (person: WhosOutPerson) => dates.day(person.backOn ?? addDays(person.endDate, 1), { lowercase: true, hideYear: true });
  const returns = (person: WhosOutPerson) =>
    isOnlyToday(person, today) ? t("whosOut.onlyToday") : t("whosOut.back", { date: back(person) });
  const empty = (
    <WidgetEmpty
      size={size}
      scene="people-s"
      title={t("whosOut.emptyTitle")}
      line={audience === "TEAM" ? t("whosOut.emptyLine") : t("whosOut.emptyLineEveryone")}
    />
  );

  if (size === "S") {
    const outToday = people.filter((p) => p.startDate <= today && p.endDate >= today);
    return (
      <WidgetCard title={title} size={size} aside={<span className="text-hint leading-5 text-tertiary">{audience === "TEAM" ? t("whosOut.myTeam") : t("whosOut.everyone")}</span>}>
        <SmallFooter
          value={outToday.length}
          word={t("whosOut.outToday", { count: outToday.length })}
          aside={
            outToday.length > 0 && (
              <span className="flex -space-x-2">
                {outToday.slice(0, 3).map((p) => {
                  const name = fullName(p.firstName, p.lastName) || t("card.unnamed");
                  return <PersonFace key={`${p.userId}-${p.startDate}`} name={name} avatarUrl={p.avatarUrl} detail={typeOf(p, away)} size={28} />;
                })}
              </span>
            )
          }
        />
      </WidgetCard>
    );
  }

  if (size === "M") {
    return (
      <WidgetCard title={title} size={size} aside={calendarLink}>
        {/* O2: the switch hugs its two words. */}
        <div className="self-start">{scope}</div>
        {people.length === 0 ? (
          empty
        ) : (
          <WidgetScroll>
            <ul className="flex flex-col divide-y divide-divider">
              {people.map((p) => {
                const name = fullName(p.firstName, p.lastName) || t("card.unnamed");
                return (
                  <li key={`${p.userId}-${p.startDate}`}>
                    <Link
                      href={`/organization/people/${p.userId}/personal`}
                      tabIndex={preview ? -1 : undefined}
                      className={TWO_LINE_ROW.row}
                    >
                      <PersonFace name={name} avatarUrl={p.avatarUrl} size={28} />
                      {/* O3: the type under the name, the return on the right; no amber in this list. */}
                      <span className="min-w-0 flex-1">
                        <span className={TWO_LINE_ROW.name}>{name}</span>
                        <span className={TWO_LINE_ROW.line}>{typeOf(p, away)}</span>
                      </span>
                      <span className="shrink-0 text-hint leading-5 text-tertiary">{returns(p)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </WidgetScroll>
        )}
      </WidgetCard>
    );
  }

  const week = workWeek(today, weekStartsOn);
  const friday = week[4];
  const weekday = (iso: string) => new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));
  const lanes = packLanes(
    people
      .filter((p) => p.endDate >= week[0] && p.startDate <= friday)
      .map((p) => {
        const first = Math.max(0, week.findIndex((d) => d >= p.startDate));
        const runsOff = runsPastWeek(p, friday);
        const last = runsOff ? 4 : Math.max(first, week.filter((d) => d <= p.endDate).length - 1);
        return { p, first, last, runsOff };
      }),
  );
  // O7: Upcoming fills the free space only when few people are out this week.
  const upcoming = lanes.length <= 2 ? data.upcoming ?? [] : [];

  return (
    <WidgetCard title={title} size={size} aside={<span className="flex items-center gap-3">{scope}{calendarLink}</span>}>
      <div className="grid grid-cols-5 gap-1 text-center">
        {week.map((day) => (
          <span key={day} className={cn("flex flex-col gap-1 text-hint", day === today ? "font-semibold text-accent-text" : "text-tertiary")}>
            <span>{weekday(day)}</span>
            <span className="text-home-day">{Number(day.slice(8))}</span>
          </span>
        ))}
      </div>
      {lanes.length === 0 && upcoming.length === 0 ? (
        <p className="py-6 text-center text-body text-tertiary">{t("whosOut.noLeave")}</p>
      ) : (
        <WidgetScroll>
          <ul className="flex flex-col gap-2">
            {lanes.map((row) => (
              <li key={row.map(({ p }) => `${p.userId}-${p.startDate}`).join("|")} className="grid grid-cols-5 gap-1">
                {row.map(({ p, first, last: lastIndex, runsOff }) => {
              const name = fullName(p.firstName, p.lastName) || t("card.unnamed");
              const color = TAG_CLASSES[toTagColor(p.policyColor)];
              const pending = PENDING.has(p.status);
              const oneDay = first === lastIndex && !runsOff;
              return (
                  <Tooltip key={`${p.userId}-${p.startDate}`}>
                    <TooltipTrigger asChild>
                      <Link
                        href={`/organization/people/${p.userId}/personal`}
                        tabIndex={preview ? -1 : undefined}
                        style={{ gridColumn: `${first + 1} / ${lastIndex + 2}` }}
                        className={cn(
                          "flex h-8 min-w-0 items-center gap-1.5 px-[3px] text-label leading-5",
                          runsOff ? "rounded-l-pill" : "rounded-pill",
                          pending ? cn("border border-dashed bg-card", color.border, color.text) : cn(color.chip),
                          runsOff && "[mask-image:linear-gradient(to_right,black_80%,transparent)]",
                        )}
                      >
                        <LaneFace name={name} avatarUrl={p.avatarUrl} ink={color.text} />
                        <span className="truncate pr-2">
                          {oneDay
                            ? (p.firstName ?? name)
                            : t("whosOut.lane", {
                                name: p.firstName ?? name,
                                type: typeOf(p, away).toLocaleLowerCase(locale),
                                runsOff: runsOff ? "yes" : "no",
                                back: back(p),
                              })}
                        </span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent title={name}>
                      {t("whosOut.tooltip", { type: typeOf(p, away), dates: dates.range(p.startDate, p.endDate, { weekday: true, hideYear: true }) })}
                    </TooltipContent>
                  </Tooltip>
              );
                })}
              </li>
            ))}
          </ul>
          {/* Free space under the lanes: the leave that starts after this week (H12) — only with few people out (O7). */}
          {lanes.length <= 2 && (
          <div className="mt-4 flex flex-col gap-2 border-t border-divider pt-3">
            <p className="text-hint font-medium text-tertiary">{t("whosOut.upcoming")}</p>
            {upcoming.length === 0 ? (
              <p className="text-label font-normal text-tertiary">{t("whosOut.noLeave")}</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {upcoming.map((p) => {
                  const name = fullName(p.firstName, p.lastName) || t("card.unnamed");
                  return (
                    <li key={`${p.userId}-${p.startDate}`} className="flex min-w-0 items-center gap-2 text-label font-normal">
                      <PersonFace name={name} avatarUrl={p.avatarUrl} size={24} />
                      <span className="shrink-0 font-medium text-primary">{p.firstName ?? name}</span>
                      <span className="min-w-0 truncate text-tertiary">{typeOf(p, away).toLocaleLowerCase()}</span>
                      <span className="ml-auto shrink-0 text-secondary">{dates.range(p.startDate, p.endDate, { weekday: true, hideYear: true })}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          )}
        </WidgetScroll>
      )}
    </WidgetCard>
  );
};
