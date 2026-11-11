"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { useUserSettings } from "@/components/modules/firstRun/hooks";
import { useDisplayLocale, useShortDates } from "@/lib/date";
import { dayAmountArgs, type TimeOffPolicy } from "@/models/timeOff";
import { useTimeOffPolicies } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies";
import { useTimeOffRequestsByUser } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffRequestsByUser";
import { useMyPublicHolidays } from "@/components/modules/home/hooks";
import { isoDateInZone } from "@/components/modules/home/utils/zonedTime";
import { useRequestTimeOff } from "@/components/modules/home/components/HomeRequestTimeOff";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  BigNumber,
  WidgetCard,
  WidgetEmpty,
  WidgetError,
  WidgetSkeleton,
} from "@/components/modules/home/components/WidgetCard";
import type { HomeWidgetProps } from "./catalogue";

/** A type's name reads in the countdown only while it is short: "days to your parental leave", not a sentence. */
const MAX_TYPE_NAME = 24;

const daysBetween = (from: string, to: string) =>
  Math.round((new Date(`${to}T12:00:00Z`).getTime() - new Date(`${from}T12:00:00Z`).getTime()) / 86_400_000);

type Next = { kind: "LEAVE" | "HOLIDAY"; start: string; end: string; name: string | null; amount: number | null; href: string };

/** The calendar leaf in the top right of the Small one: the month in the accent, the day under it. */
const CalendarLeaf: React.FC<{ date: string }> = ({ date }) => {
  const locale = useDisplayLocale();
  const d = new Date(`${date}T12:00:00Z`);
  return (
    <span className="flex w-9 shrink-0 flex-col items-center overflow-hidden rounded-control border border-divider bg-card" aria-hidden>
      <span className="w-full bg-accent-subtle text-center text-hint font-semibold text-accent-text">
        {new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" }).format(d)}
      </span>
      <span className="text-card-title text-primary">{d.getUTCDate()}</span>
    </span>
  );
};

/**
 * A quiet countdown to the reader's next day off (`home-widgets` § 3): the next **approved** leave or the next public
 * holiday where they work, whichever comes first. Upcoming holidays had a widget of their own; it is folded in here.
 */
export const NextTimeOffWidget: React.FC<HomeWidgetProps> = ({ size, preview }) => {
  const t = useTranslations("home");
  const tTimeOff = useTranslations("timeOff");
  const dates = useShortDates();
  const { userId } = useCurrentUser();
  const settings = useUserSettings();
  const requests = useTimeOffRequestsByUser({ userId: userId ?? "" });
  const policies = useTimeOffPolicies();
  const holidays = useMyPublicHolidays(userId ?? undefined);
  const requestTimeOff = useRequestTimeOff();
  const title = t("widgets.nextTimeOff.title");

  if (!userId || requests.isLoading || holidays.isLoading) {
    return (
      <WidgetCard title={title} size={size}>
        <WidgetSkeleton number rows={0} />
      </WidgetCard>
    );
  }
  if (requests.error) {
    return (
      <WidgetCard title={title} size={size}>
        <WidgetError size={size} message={t("card.couldNotLoad", { thing: "timeOff" })} onRetry={() => void requests.refetch()} />
      </WidgetCard>
    );
  }

  const today = isoDateInZone(new Date(), settings.data?.companyTimeZone);
  const policyMap = new Map<string, TimeOffPolicy>((policies.data ?? []).map((p) => [p.id, p]));
  const candidates: Next[] = [
    ...(requests.data ?? [])
      .filter((r) => r.status === "APPROVED" && r.endDate >= today)
      .map((r): Next => ({
        kind: "LEAVE",
        start: r.startDate,
        end: r.endDate,
        name: policyMap.get(r.policyId)?.name ?? null,
        amount: r.requestedAmount,
        href: `/time-off/requests/${r.id}`,
      })),
    ...(holidays.data ?? [])
      .filter((h) => (h.endDate ?? h.holidayDate) >= today)
      .map((h): Next => ({ kind: "HOLIDAY", start: h.holidayDate, end: h.endDate ?? h.holidayDate, name: h.name, amount: null, href: "/calendar" })),
  ].sort((a, b) => a.start.localeCompare(b.start));
  const next = candidates[0];

  if (!next) {
    return (
      <WidgetCard title={title} size={size}>
        <WidgetEmpty
          size={size}
          scene="calendar"
          title={t("nextTimeOff.emptyTitle")}
          line={t("nextTimeOff.emptyLine")}
          action={
            requestTimeOff && size !== "S" ? (
              <Button type="button" variant="secondary" size="sm" disabled={preview} onClick={requestTimeOff}>
                {t("nextTimeOff.requestTimeOff")}
              </Button>
            ) : undefined
          }
        />
      </WidgetCard>
    );
  }

  const until = daysBetween(today, next.start);
  const what =
    next.kind === "HOLIDAY"
      ? next.name ?? t("nextTimeOff.yourTimeOff")
      : next.name && next.name.length <= MAX_TYPE_NAME
        ? t("nextTimeOff.yourType", { type: next.name.toLocaleLowerCase() })
        : t("nextTimeOff.yourTimeOff");
  const countdown =
    next.start <= today ? (
      <p className="text-home-sentence-l text-primary">{t("nextTimeOff.enjoy")}</p>
    ) : until === 1 ? (
      <p className="text-hero-m text-primary">{t("nextTimeOff.tomorrow")}</p>
    ) : (
      <BigNumber
        size={size === "S" ? "s" : "xxl"}
        value={until}
        word={t("nextTimeOff.daysTo", { count: until, what })}
        className={size === "S" ? "flex-wrap whitespace-normal" : "flex-col items-start gap-0"}
      />
    );

  if (size === "S") {
    return (
      <WidgetCard title={title} size={size} aside={<CalendarLeaf date={next.start} />}>
        <Link href={next.href} tabIndex={preview ? -1 : undefined} className="mt-auto block min-w-0">
          {countdown}
        </Link>
      </WidgetCard>
    );
  }

  const span = dates.range(next.start, next.end, { weekday: true });
  return (
    <WidgetCard
      title={title}
      size={size}
      aside={next.kind === "HOLIDAY" ? <StatusBadge status="info" size="sm" label={t("nextTimeOff.holiday")} /> : <StatusBadge status="approved" size="sm" label={t("nextTimeOff.approved")} />}
    >
      <p className="flex items-center gap-1.5 text-label text-secondary">
        <Icon icon={Calendar03Icon} size="sm" className="text-tertiary" />
        {next.amount !== null ? t("nextTimeOff.span", { dates: span, days: tTimeOff("amount.days", dayAmountArgs(next.amount)) }) : span}
      </p>
      <Link href={next.href} tabIndex={preview ? -1 : undefined} className="mt-auto block min-w-0">
        {countdown}
      </Link>
    </WidgetCard>
  );
};
