"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { CheckmarkCircle02Icon, HourglassIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/desact/popover";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { useUserSettings } from "@/components/modules/firstRun/hooks";
import { cn } from "@/lib/cn";
import { useDisplayLocale, useShortDates } from "@/lib/date";
import {
  formatDayAmount,
  TimeOffPolicyUnit,
  type EmployeeTimeOffBalance,
  type TimeOffPolicy,
  type TimeOffRequest,
} from "@/models/timeOff";
import { useEmployeeTimeOffBalancesByUser } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/hooks/useEmployeeTimeOffBalancesByUser";
import { useTimeOffPolicies } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies";
import { useTimeOffRequestsByUser } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffRequestsByUser";
import { isoDateInZone } from "@/components/modules/home/utils/zonedTime";
import { useRequestTimeOff } from "@/components/modules/home/components/HomeRequestTimeOff";
import {
  BigNumber,
  WidgetCard,
  WidgetEmpty,
  WidgetError,
  WidgetLink,
  WidgetSkeleton,
} from "@/components/modules/home/components/WidgetCard";
import type { HomeWidgetProps } from "./catalogue";

const HOLDING = new Set(["APPROVED", "PENDING", "CANCELLATION_PENDING"]);

/** The balance a policy is spending today: the period that holds today, or else the latest one. */
export const currentBalances = (balances: EmployeeTimeOffBalance[], today: string): EmployeeTimeOffBalance[] => {
  const byPolicy = new Map<string, EmployeeTimeOffBalance>();
  for (const balance of balances) {
    const holds = (b: EmployeeTimeOffBalance) => b.periodStart <= today && (b.periodEnd === null || b.periodEnd >= today);
    const kept = byPolicy.get(balance.policyId);
    if (!kept || (holds(balance) && !holds(kept)) || (!holds(kept) && !holds(balance) && balance.periodStart > kept.periodStart)) {
      byPolicy.set(balance.policyId, balance);
    }
  }
  return [...byPolicy.values()];
};

const unitOf = (policy: TimeOffPolicy | undefined) => (policy?.unit === TimeOffPolicyUnit.Hours ? "hours" : "days");

/** A request's days as Home writes them: a span ("4–7 Dec"), or one day with its weekday ("Fri, 4 Dec"); no year (A7). */
const useRequestDays = () => {
  const dates = useShortDates();
  return (request: TimeOffRequest) =>
    request.startDate === request.endDate
      ? dates.date(request.startDate, { weekday: true, hideYear: true })
      : dates.range(request.startDate, request.endDate, { hideYear: true });
};

/** A request's status as an icon and a word with no fill: Pending in amber, Approved in pine. */
const RequestStatus: React.FC<{ pending: boolean }> = ({ pending }) => {
  const t = useTranslations("home");
  return (
    <span className={cn("flex shrink-0 items-center gap-1 text-hint leading-5 font-medium", pending ? "text-status-pending-text" : "text-status-approved-text")}>
      <Icon icon={pending ? HourglassIcon : CheckmarkCircle02Icon} size="sm" className="size-3.5" />
      {pending ? t("timeOff.pending") : t("timeOff.approved")}
    </span>
  );
};

/**
 * A request as a one-line pill (C4, C6): 36 high, its dates and its status as an icon and a word with no fill. Pending
 * is a 1 px dashed accent edge on white, approved the Mist fill. `wide` (Large) puts the status at the right end.
 */
const RequestPill: React.FC<{ request: TimeOffRequest; href: string; tabIndex?: number; wide?: boolean }> = ({ request, href, tabIndex, wide }) => {
  const days = useRequestDays();
  const pending = request.status !== "APPROVED";
  return (
    <Link
      href={href}
      tabIndex={tabIndex}
      className={cn(
        "inline-flex h-9 min-w-0 items-center gap-2 rounded-pill text-label leading-5 text-primary",
        wide ? "justify-between pr-[18px] pl-4" : "pr-3.5 pl-3",
        pending ? "border border-dashed border-accent bg-card" : "bg-subtle",
      )}
    >
      <span className="truncate">{days(request)}</span>
      <RequestStatus pending={pending} />
    </Link>
  );
};

/** A request in the "+N" menu (C5): a plain row 32 high, the date on the left and the status on the right. */
const RequestRow: React.FC<{ request: TimeOffRequest }> = ({ request }) => {
  const days = useRequestDays();
  return (
    <Link
      href={`/time-off/requests/${request.id}`}
      className="flex h-8 min-w-0 items-center justify-between gap-3 rounded-control px-2 text-label text-primary hover:bg-subtle"
    >
      <span className="truncate">{days(request)}</span>
      <RequestStatus pending={request.status !== "APPROVED"} />
    </Link>
  );
};

/**
 * The reader's own time off (`home-widgets` § 2): what is left of the main type as the hero, the other types as a quiet
 * list, the nearest request as a pill and "+N" for the rest; Request time off opens the dialog right here. Only what is
 * left — never "of N", a total or "used"; a type without a limit says "No limit".
 */
export const TimeOffWidget: React.FC<HomeWidgetProps> = ({ size, preview }) => {
  const t = useTranslations("home");
  const { userId } = useCurrentUser();
  const settings = useUserSettings();
  const balances = useEmployeeTimeOffBalancesByUser({ userId: userId ?? "" });
  const policies = useTimeOffPolicies();
  const requests = useTimeOffRequestsByUser({ userId: userId ?? "" });
  const requestTimeOff = useRequestTimeOff();
  const locale = useDisplayLocale();
  const title = t("widgets.timeOff.title");
  const myTimeOff = userId ? `/organization/people/${userId}/time-off` : "/time-off";

  if (!userId || balances.isLoading || policies.isLoading || requests.isLoading) {
    return (
      <WidgetCard title={title} size={size}>
        <WidgetSkeleton number rows={size === "S" ? 0 : 2} />
      </WidgetCard>
    );
  }
  const error = balances.error ?? requests.error;
  if (error) {
    return (
      <WidgetCard title={title} size={size}>
        <WidgetError
          size={size}
          message={t("card.couldNotLoad", { thing: "timeOff" })}
          onRetry={() => void (balances.error ? balances.refetch() : requests.refetch())}
        />
      </WidgetCard>
    );
  }

  const today = isoDateInZone(new Date(), settings.data?.companyTimeZone);
  const order = new Map((policies.data ?? []).map((policy, i) => [policy.id, i]));
  const policyMap = new Map((policies.data ?? []).map((policy) => [policy.id, policy]));
  const current = currentBalances(balances.data ?? [], today).sort(
    (a, b) => (order.get(a.policyId) ?? 99) - (order.get(b.policyId) ?? 99),
  );
  if (current.length === 0) {
    return (
      <WidgetCard title={title} size={size} aside={<WidgetLink href={myTimeOff}>{t("timeOff.link")}</WidgetLink>}>
        <WidgetEmpty size={size} scene="time-off-s" title={t("timeOff.emptyTitle")} line={t("timeOff.emptyLine")} />
      </WidgetCard>
    );
  }

  const [main, ...others] = current;
  const mainPolicy = policyMap.get(main.policyId);
  // "2 days left" with the number in Ink 600 (C3).
  const left = (balance: EmployeeTimeOffBalance) => {
    const policy = policyMap.get(balance.policyId);
    if (policy?.unlimitedQuota) return t("timeOff.noLimit");
    return t.rich("timeOff.left", {
      amount: formatDayAmount(balance.currentBalance),
      count: balance.currentBalance,
      unit: unitOf(policy),
      b: (chunks) => <span className="font-semibold text-primary">{chunks}</span>,
    });
  };
  // The leave type's name, never the policy's (A9): "vacation days", "Sick leave".
  const typeName = (policy: TimeOffPolicy | undefined) => policy?.leaveTypeName || policy?.name || "";
  const upcoming = (requests.data ?? [])
    .filter((r) => HOLDING.has(r.status) && r.endDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const mainWord = t("timeOff.mainWord", {
    name: typeName(mainPolicy).toLocaleLowerCase(locale),
    count: main.currentBalance,
    unit: unitOf(mainPolicy),
  });
  // A main type with no limit has no number to show; it says so in words (PRODUCT-RULES 5).
  const heroValue = mainPolicy?.unlimitedQuota ? t("timeOff.noLimit") : formatDayAmount(main.currentBalance);
  const heroWord = mainPolicy?.unlimitedQuota ? typeName(mainPolicy) : mainWord;
  const requestButton = (wide: boolean, small?: boolean) =>
    requestTimeOff && (
      <Button type="button" size={small ? "sm" : "md"} className={cn(wide && "w-full", small && "leading-5" /* C2: 13/20 in Small */)} tabIndex={preview ? -1 : undefined} onClick={requestTimeOff}>
        {t("timeOff.requestTimeOff")}
      </Button>
    );
  const tab = preview ? -1 : undefined;

  if (size === "S") {
    // C2: a small label row in place of the title, the number 2 under it, the button 32 high across the card.
    return (
      <WidgetCard title={title} size={size} bare className="gap-3">
        <div className="flex min-w-0 items-center justify-between gap-3 text-label leading-5">
          <span className="text-tertiary">{t("timeOff.label")}</span>
          <Link href={myTimeOff} tabIndex={tab} className="shrink-0 text-accent-text underline-offset-4 hover:underline">
            {t("timeOff.link")}
          </Link>
        </div>
        <BigNumber size="s" value={heroValue} word={heroWord} className="-mt-2.5" />
        <div className="mt-auto">{requestButton(true, true)}</div>
      </WidgetCard>
    );
  }

  // C3: 13/18 400 secondary, the value's number in Ink 600; rows 4 apart, 10 under the hairline.
  const otherTypes = (
    <ul className="flex flex-col gap-1">
      {others.map((balance) => (
        <li key={balance.id} className="flex items-baseline justify-between gap-3 text-label font-normal text-secondary">
          <span className="truncate">{typeName(policyMap.get(balance.policyId))}</span>
          <span className="shrink-0">{left(balance)}</span>
        </li>
      ))}
    </ul>
  );

  // "+2" (M): a 36 circle on Mist; "+2 more" (L): plain accent text. Opened: plain rows, a hairline, the link (C4–C6).
  const moreMenu = (rest: TimeOffRequest[], long: boolean) =>
    rest.length > 0 && (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            tabIndex={tab}
            className={cn(
              "shrink-0 text-hint leading-5 font-medium",
              long
                ? "w-fit pl-4 text-accent-text underline-offset-4 hover:underline"
                : "inline-flex size-9 items-center justify-center rounded-pill bg-subtle text-secondary hover:bg-mist",
            )}
          >
            {long ? t("timeOff.moreLong", { count: rest.length }) : t("timeOff.more", { count: rest.length })}
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="flex w-64 flex-col p-2">
          {rest.map((request) => (
            <RequestRow key={request.id} request={request} />
          ))}
          <span aria-hidden className="my-1 h-px bg-divider" />
          <Link href={myTimeOff} className="flex h-8 items-center rounded-control px-2 text-label text-accent-text hover:bg-subtle">
            {t("timeOff.allInMyTimeOff")}
          </Link>
        </PopoverContent>
      </Popover>
    );

  const hero = (
    <BigNumber
      size={size === "L" ? "xl" : "l"}
      value={heroValue}
      word={heroWord}
      className={cn("flex-col items-start gap-0", size === "L" && "[&>span:first-child]:leading-[72px]")}
    />
  );

  if (size === "M") {
    const [nearest, ...rest] = upcoming;
    return (
      <WidgetCard title={title} size={size} aside={<WidgetLink href={myTimeOff}>{t("timeOff.link")}</WidgetLink>}>
        {hero}
        {others.length > 0 && <div className="border-t border-divider pt-2.5">{otherTypes}</div>}
        <div className="mt-auto flex flex-col gap-3">
          {nearest && (
            <div className="flex min-w-0 items-center gap-2">
              <RequestPill request={nearest} href={`/time-off/requests/${nearest.id}`} tabIndex={tab} />
              {moreMenu(rest, false)}
            </div>
          )}
          {requestButton(true)}
        </div>
      </WidgetCard>
    );
  }

  const shown = upcoming.slice(0, 3);
  const rest = upcoming.slice(3);
  return (
    <WidgetCard title={title} size={size} aside={<WidgetLink href={myTimeOff}>{t("timeOff.link")}</WidgetLink>}>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-7">
        <div className="flex min-w-0 flex-col gap-4">
          {hero}
          {others.length > 0 && <div className="border-t border-divider pt-2.5">{otherTypes}</div>}
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          {shown.length > 0 && <p className="text-hint leading-5 font-medium text-tertiary">{t("timeOff.comingUp")}</p>}
          {shown.map((request) => (
            <RequestPill key={request.id} request={request} href={`/time-off/requests/${request.id}`} tabIndex={tab} wide />
          ))}
          {moreMenu(rest, true)}
          <div className="mt-auto flex justify-end">{requestButton(false)}</div>
        </div>
      </div>
    </WidgetCard>
  );
};
