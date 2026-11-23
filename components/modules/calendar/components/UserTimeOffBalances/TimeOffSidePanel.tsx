"use client";

import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Skeleton } from "@/components/desact/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/desact/tooltip";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PolicyMarker } from "@/components/ui/PolicyMarker";
import { TimeOffRequestStatus } from "@/api/modules/timeOff/timeOffRequests/dto";
import { TimeOffPolicyUnit } from "@/api/modules/timeOff/timeOffPolicies/dto";
import { LeaveTypeCategory } from "@/api/modules/timeOff/leaveTypes/dto";
import type { EmployeeTimeOffBalance, TimeOffPolicy, TimeOffRequest } from "@/models/timeOff";
import { formatDayAmount } from "@/models/timeOff/formatDayAmount";
import { useShortDates } from "@/lib/date";
import { cn } from "@/lib/cn";
import { lengthOf, unitOf } from "@/components/modules/timeOff/lib/leaveWords";

const UPCOMING = 3;

/** One policy as the card shows it: the balance of the period that is running today. */
export type PolicyStanding = {
  policyId: string;
  name: string;
  color: string | null | undefined;
  unlimited: boolean;
  unit: TimeOffPolicyUnit;
  left: number;
  used: number;
  /** A VACATION-category policy leads (the owner, 2026-11-05, C5). */
  vacation: boolean;
};

/**
 * The running period of each policy — a person has a balance per period, and last year's is history.
 * The period that holds today wins; failing that, the latest.
 */
export const standingsOf = (
  balances: EmployeeTimeOffBalance[],
  policyMap: Map<string, TimeOffPolicy>,
  todayISO: string,
  /** The name shown for a policy that is not in the map. */
  fallbackName: string,
): PolicyStanding[] => {
  const byPolicy = new Map<string, EmployeeTimeOffBalance>();
  for (const b of balances) {
    const current = byPolicy.get(b.policyId);
    const holdsToday = b.periodStart <= todayISO && (b.periodEnd === null || b.periodEnd >= todayISO);
    const currentHolds = current
      ? current.periodStart <= todayISO && (current.periodEnd === null || current.periodEnd >= todayISO)
      : false;
    if (!current || (holdsToday && !currentHolds) || (holdsToday === currentHolds && b.periodStart > current.periodStart)) {
      byPolicy.set(b.policyId, b);
    }
  }
  return [...byPolicy.values()].map((b) => {
    const policy = policyMap.get(b.policyId);
    return {
      policyId: b.policyId,
      name: policy?.name ?? fallbackName,
      color: policy?.color,
      unlimited: policy?.unlimitedQuota ?? false,
      unit: policy?.unit ?? TimeOffPolicyUnit.Days,
      left: b.currentBalance,
      used: b.usedBalance,
      vacation: policy?.leaveTypeCategory === LeaveTypeCategory.Vacation,
    };
  });
};

/**
 * The order of a person's balances (profile-time-off Q24, Q27): **every** policy — a vacation policy first (there is
 * no company-wide primary policy, the owner 2026-11-05, C5), of several the one with more days left; then the most
 * used. The list scrolls inside the card; nothing is left out behind an "N more".
 */
export const panelOrder = (standings: PolicyStanding[]): PolicyStanding[] =>
  [...standings].sort((a, b) => {
    if (a.vacation !== b.vacation) return a.vacation ? -1 : 1;
    if (a.vacation && b.vacation) return b.left - a.left || a.name.localeCompare(b.name);
    return b.used - a.used || a.name.localeCompare(b.name);
  });

/** A name cut with … shows its whole text in the light tooltip — only when it is cut. */
const CutName: FC<{ name: string }> = ({ name }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [cut, setCut] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (el) setCut(el.scrollWidth > el.clientWidth);
  }, [name]);
  const text = <span ref={ref} className="min-w-0 flex-1 truncate text-left text-body font-medium text-primary">{name}</span>;
  if (!cut) return text;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{text}</TooltipTrigger>
      <TooltipContent>{name}</TooltipContent>
    </Tooltip>
  );
};

const BalanceRow: FC<{ standing: PolicyStanding; onOpen: () => void }> = ({ standing, onOpen }) => {
  const t = useTranslations("leave");
  const unit = standing.unit === TimeOffPolicyUnit.Hours ? "hours" : "days";
  const value = standing.unlimited ? standing.used : standing.left;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-2 border-divider py-3 text-left transition-colors duration-(--duration-hover) hover:bg-subtle [&+&]:border-t"
    >
      <PolicyMarker color={standing.color} />
      <CutName name={standing.name} />
      <span className="flex shrink-0 flex-col items-end">
        <span className="font-heading text-leave-balance tabular-nums text-primary">{formatDayAmount(value)}</span>
        <span className="text-hint text-tertiary">
          {standing.unlimited ? t("taken", { unit, count: value }) : t("left", { unit, count: value })}
        </span>
      </span>
    </button>
  );
};

const UPCOMING_STATUSES = new Set<string>([
  TimeOffRequestStatus.Pending,
  TimeOffRequestStatus.Approved,
  TimeOffRequestStatus.CancellationPending,
]);

/**
 * The time off card's body (profile-time-off Q01, Q24, Q27): **Balances** — every policy, each row opening its
 * balance history (Q20), no chevron, the list scrolling inside the card with a fade; **Upcoming** — what is booked
 * ahead, each row opening the request in full, and nothing at all when nothing is (Q23); **All requests ›**.
 */
export const TimeOffSidePanel: FC<{
  balances: EmployeeTimeOffBalance[] | undefined;
  balancesLoading: boolean;
  requests: TimeOffRequest[] | undefined;
  policyMap: Map<string, TimeOffPolicy>;
  todayISO: string;
  onOpenBalance: (policyId: string) => void;
  onOpenRequest: (requestId: string) => void;
  onOpenAll: () => void;
}> = ({ balances, balancesLoading, requests, policyMap, todayISO, onOpenBalance, onOpenRequest, onOpenAll }) => {
  const t = useTranslations("leave");
  const tCalendar = useTranslations("calendar");
  const shortDates = useShortDates();
  const fallbackName = tCalendar("balances.fallbackName");
  const ordered = useMemo(
    () => panelOrder(standingsOf(balances ?? [], policyMap, todayISO, fallbackName)),
    [balances, policyMap, todayISO, fallbackName],
  );

  const upcoming = useMemo(
    () =>
      (requests ?? [])
        .filter((r) => UPCOMING_STATUSES.has(r.status) && r.endDate >= todayISO)
        .sort((a, b) => a.startDate.localeCompare(b.startDate))
        .slice(0, UPCOMING),
    [requests, todayISO],
  );

  // The fade under a list that scrolls: only while there is more below.
  const listRef = useRef<HTMLDivElement>(null);
  const [moreBelow, setMoreBelow] = useState(false);
  const measure = () => {
    const el = listRef.current;
    if (el) setMoreBelow(el.scrollHeight - el.scrollTop - el.clientHeight > 1);
  };
  useEffect(measure, [ordered]);

  return (
    <>
      <section>
        <h4 className="mb-1 text-hint font-medium text-tertiary">{t("tab.balances")}</h4>
        {balancesLoading ? (
          <div className="flex flex-col gap-3 py-2">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : (
          <div
            ref={listRef}
            onScroll={measure}
            className={cn("scroll-thumb -mr-2 max-h-[345px] overflow-y-auto pr-2", moreBelow && "[mask-image:linear-gradient(to_bottom,black_calc(100%-32px),transparent)]")}
          >
            {ordered.map((s) => <BalanceRow key={s.policyId} standing={s} onOpen={() => onOpenBalance(s.policyId)} />)}
          </div>
        )}
      </section>

      {upcoming.length > 0 && (
        <section>
          <h4 className="mb-1 text-hint font-medium text-tertiary">{t("tab.upcoming")}</h4>
          {upcoming.map((r) => {
            const policy = policyMap.get(r.policyId);
            return (
              <button
                type="button"
                key={r.id}
                onClick={() => onOpenRequest(r.id)}
                className="flex w-full items-center gap-2 border-divider py-2.5 text-left hover:bg-subtle [&+&]:border-t"
              >
                <PolicyMarker color={policy?.color} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body font-medium text-primary">
                    {shortDates.range(r.startDate, r.endDate, { weekday: true })}
                  </span>
                  <span className="block truncate text-hint text-tertiary">
                    {t("tab.upcomingLine", {
                      policy: policy?.name ?? fallbackName,
                      length: lengthOf(t, r.requestedAmount, unitOf(policy) === "hours" ? "hours" : "days"),
                    })}
                  </span>
                </span>
                <StatusBadge status={r.status === TimeOffRequestStatus.Approved ? "approved" : "pending"} />
              </button>
            );
          })}
        </section>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onOpenAll}
          className="inline-flex items-center gap-1 text-body font-medium text-accent-text hover:underline"
        >
          {t("tab.allRequests")}
          <Icon icon={ArrowRight01Icon} size="sm" />
        </button>
      </div>
    </>
  );
};
