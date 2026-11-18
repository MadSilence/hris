"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/desact/tooltip";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { cn } from "@/lib/cn";
import { useDisplayLocale, useShortDates, useWeekStartsOn } from "@/lib/date";
import { TAG_CLASSES, toTagColor } from "@/lib/theme/tags";
import type { WhosOutAudience, WhosOutPerson } from "@/models/home";
import { useWhosOut } from "@/components/modules/home/hooks";
import {
  BigNumber,
  PersonFace,
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

const typeOf = (person: WhosOutPerson, away: string) => person.policyName ?? person.leaveTypeName ?? away;

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
  const back = (person: WhosOutPerson) => dates.date(addDays(person.endDate, 1), { weekday: true });
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
      <WidgetCard title={title} size={size} aside={<span className="text-hint text-tertiary">{audience === "TEAM" ? t("whosOut.myTeam") : t("whosOut.everyone")}</span>}>
        <BigNumber size="s" value={outToday.length} word={t("whosOut.outToday", { count: outToday.length })} />
        <span className="flex -space-x-1.5">
          {outToday.slice(0, 4).map((p) => {
            const name = fullName(p.firstName, p.lastName) || t("card.unnamed");
            return <PersonFace key={`${p.userId}-${p.startDate}`} name={name} avatarUrl={p.avatarUrl} detail={typeOf(p, away)} size={28} />;
          })}
        </span>
      </WidgetCard>
    );
  }

  if (size === "M") {
    return (
      <WidgetCard title={title} size={size} aside={calendarLink}>
        {scope}
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
                      className="-mx-2 flex items-center gap-3 rounded-control px-2 py-2.5 hover:bg-subtle"
                    >
                      <PersonFace name={name} avatarUrl={p.avatarUrl} size={28} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-body font-medium text-primary">{name}</span>
                        <span className={cn("block truncate text-hint", PENDING.has(p.status) ? "text-status-pending-text" : "text-tertiary")}>
                          {t("whosOut.typeLine", { type: typeOf(p, away), back: t("whosOut.back", { date: back(p) }) })}
                        </span>
                      </span>
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
  const lanes = people.filter((p) => p.endDate >= week[0] && p.startDate <= friday);
  const upcoming = data.upcoming ?? [];

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
            {lanes.map((p) => {
              const name = fullName(p.firstName, p.lastName) || t("card.unnamed");
              const first = Math.max(0, week.findIndex((d) => d >= p.startDate));
              const runsOff = p.endDate > friday;
              const lastIndex = runsOff ? 4 : Math.max(first, week.filter((d) => d <= p.endDate).length - 1);
              const color = TAG_CLASSES[toTagColor(p.policyColor)];
              const pending = PENDING.has(p.status);
              const oneDay = first === lastIndex && !runsOff;
              return (
                <li key={`${p.userId}-${p.startDate}`} className="grid grid-cols-5 gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={`/organization/people/${p.userId}/personal`}
                        tabIndex={preview ? -1 : undefined}
                        style={{ gridColumn: `${first + 1} / ${lastIndex + 2}` }}
                        className={cn(
                          "flex h-8 min-w-0 items-center gap-2 px-[3px] text-label leading-5",
                          runsOff ? "rounded-l-pill" : "rounded-pill",
                          pending ? cn("border-[1.5px] border-dashed bg-card", color.border, color.text) : cn(color.chip),
                          runsOff && "[mask-image:linear-gradient(to_right,black_80%,transparent)]",
                        )}
                      >
                        <PersonFace name={name} avatarUrl={p.avatarUrl} size={26} />
                        <span className="truncate pr-2">
                          {oneDay
                            ? (p.firstName ?? name)
                            : t("whosOut.lane", {
                                name: p.firstName ?? name,
                                type: typeOf(p, away),
                                runsOff: runsOff ? "yes" : "no",
                                back: back(p),
                              })}
                        </span>
                        {runsOff && <Icon icon={ArrowRight01Icon} size="sm" className="ml-auto shrink-0" />}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent title={name}>
                      {t("whosOut.tooltip", { type: typeOf(p, away), dates: dates.range(p.startDate, p.endDate, { weekday: true }) })}
                    </TooltipContent>
                  </Tooltip>
                </li>
              );
            })}
          </ul>
          {/* Free space under the lanes: the leave that starts after this week (H12). */}
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
                      <span className="ml-auto shrink-0 text-secondary">{dates.range(p.startDate, p.endDate, { weekday: true })}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </WidgetScroll>
      )}
    </WidgetCard>
  );
};
