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
import { useShortDates } from "@/lib/date";
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

/** The nearest request, one line: its dates and its status as an icon and a word, with no fill (`home-widgets` § 2). */
const RequestPill: React.FC<{ request: TimeOffRequest; href: string; tabIndex?: number }> = ({ request, href, tabIndex }) => {
  const t = useTranslations("home");
  const dates = useShortDates();
  const pending = request.status !== "APPROVED";
  return (
    <Link
      href={href}
      tabIndex={tabIndex}
      className={cn(
        "inline-flex h-8 min-w-0 items-center gap-2 rounded-pill px-3 text-label text-primary",
        pending ? "border-[1.5px] border-dashed border-accent bg-card" : "bg-subtle",
      )}
    >
      <span className="truncate">{dates.range(request.startDate, request.endDate)}</span>
      <span className={cn("flex shrink-0 items-center gap-1 text-hint font-semibold", pending ? "text-status-pending-text" : "text-status-approved-text")}>
        <Icon icon={pending ? HourglassIcon : CheckmarkCircle02Icon} size="sm" className="size-3.5" />
        {pending ? t("timeOff.pending") : t("timeOff.approved")}
      </span>
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
      <WidgetCard title={title} size={size}>
        <WidgetEmpty size={size} scene="time-off-s" title={t("timeOff.emptyTitle")} line={t("timeOff.emptyLine")} />
      </WidgetCard>
    );
  }

  const [main, ...others] = current;
  const mainPolicy = policyMap.get(main.policyId);
  const left = (balance: EmployeeTimeOffBalance) => {
    const policy = policyMap.get(balance.policyId);
    if (policy?.unlimitedQuota) return t("timeOff.noLimit");
    return t("timeOff.left", { amount: formatDayAmount(balance.currentBalance), count: balance.currentBalance, unit: unitOf(policy) });
  };
  const upcoming = (requests.data ?? [])
    .filter((r) => HOLDING.has(r.status) && r.endDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const mainWord = t("timeOff.mainWord", {
    name: (mainPolicy?.name ?? "").toLocaleLowerCase(),
    count: main.currentBalance,
    unit: unitOf(mainPolicy),
  });
  // A main type with no limit has no number to show; it says so in words (PRODUCT-RULES 5).
  const heroValue = mainPolicy?.unlimitedQuota ? t("timeOff.noLimit") : formatDayAmount(main.currentBalance);
  const heroWord = mainPolicy?.unlimitedQuota ? mainPolicy.name : mainWord;
  const requestButton = requestTimeOff && (
    <Button type="button" size="md" className="w-full" disabled={preview} onClick={requestTimeOff}>
      {t("timeOff.requestTimeOff")}
    </Button>
  );
  const tab = preview ? -1 : undefined;

  if (size === "S") {
    return (
      <WidgetCard title={title} size={size} aside={<WidgetLink href={myTimeOff}>{t("timeOff.link")}</WidgetLink>}>
        <BigNumber size="s" value={heroValue} word={heroWord} />
        <div className="mt-auto">{requestButton}</div>
      </WidgetCard>
    );
  }

  const otherTypes = (
    <ul className="flex flex-col gap-1.5">
      {others.map((balance) => (
        <li key={balance.id} className="flex items-baseline justify-between gap-3 text-body">
          <span className="truncate text-secondary">{policyMap.get(balance.policyId)?.name}</span>
          <span className="shrink-0 font-medium text-primary">{left(balance)}</span>
        </li>
      ))}
    </ul>
  );

  const moreMenu = (rest: TimeOffRequest[], long: boolean) =>
    rest.length > 0 && (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            tabIndex={tab}
            className="inline-flex h-8 shrink-0 items-center rounded-pill bg-mist px-2.5 text-label text-secondary hover:bg-divider"
          >
            {long ? t("timeOff.moreLong", { count: rest.length }) : t("timeOff.more", { count: rest.length })}
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="flex w-64 flex-col gap-1 p-2">
          {rest.map((request) => (
            <RequestPill key={request.id} request={request} href={`/time-off/requests/${request.id}`} />
          ))}
          <Link href={myTimeOff} className="px-2 pt-1 text-label text-accent-text hover:underline">{t("timeOff.allInMyTimeOff")}</Link>
        </PopoverContent>
      </Popover>
    );

  const hero = (
    <BigNumber
      size={size === "L" ? "xl" : "l"}
      value={heroValue}
      word={heroWord}
      className="flex-col items-start gap-0"
    />
  );

  if (size === "M") {
    const [nearest, ...rest] = upcoming;
    return (
      <WidgetCard title={title} size={size} aside={<WidgetLink href={myTimeOff}>{t("timeOff.link")}</WidgetLink>}>
        {hero}
        {others.length > 0 && <div className="border-t border-divider pt-3">{otherTypes}</div>}
        <div className="mt-auto flex flex-col gap-3">
          {nearest && (
            <div className="flex min-w-0 items-center gap-2">
              <RequestPill request={nearest} href={`/time-off/requests/${nearest.id}`} tabIndex={tab} />
              {moreMenu(rest, false)}
            </div>
          )}
          {requestButton}
        </div>
      </WidgetCard>
    );
  }

  const shown = upcoming.slice(0, 3);
  const rest = upcoming.slice(3);
  return (
    <WidgetCard title={title} size={size} aside={<WidgetLink href={myTimeOff}>{t("timeOff.link")}</WidgetLink>}>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-6">
        <div className="flex min-w-0 flex-col gap-4">
          {hero}
          {others.length > 0 && <div className="border-t border-divider pt-3">{otherTypes}</div>}
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          {shown.length > 0 && <p className="text-hint font-semibold text-tertiary">{t("timeOff.comingUp")}</p>}
          {shown.map((request) => (
            <RequestPill key={request.id} request={request} href={`/time-off/requests/${request.id}`} tabIndex={tab} />
          ))}
          {moreMenu(rest, true)}
          <div className="mt-auto">{requestButton}</div>
        </div>
      </div>
    </WidgetCard>
  );
};
