"use client";

import React from "react";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useCanAccess } from "@/components/auth/useAccess";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { useUserSettings } from "@/components/modules/firstRun/hooks";
import { formatDisplayDate } from "@/lib/date";
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
import { HomeCard, HomeCardLink, HomeEmpty, HomeRowsSkeleton } from "@/components/modules/home/components/HomeCard";

const UPCOMING_LIMIT = 3;
const HOLDING = new Set(["APPROVED", "PENDING", "CANCELLATION_PENDING"]);

/** The balance a policy is spending today: the period that holds today, or else the latest one. */
export const currentBalances = (balances: EmployeeTimeOffBalance[], today: string): EmployeeTimeOffBalance[] => {
  const byPolicy = new Map<string, EmployeeTimeOffBalance>();
  for (const balance of balances) {
    const holdsToday = balance.periodStart <= today && (balance.periodEnd === null || balance.periodEnd >= today);
    const kept = byPolicy.get(balance.policyId);
    const keptHoldsToday = kept && kept.periodStart <= today && (kept.periodEnd === null || kept.periodEnd >= today);
    if (!kept || (holdsToday && !keptHoldsToday) || (!keptHoldsToday && !holdsToday && balance.periodStart > kept.periodStart)) {
      byPolicy.set(balance.policyId, balance);
    }
  }
  return [...byPolicy.values()];
};

const unitOf = (policy: TimeOffPolicy | undefined, amount: number) =>
  policy?.unit === TimeOffPolicyUnit.Hours ? (amount === 1 ? "hour" : "hours") : amount === 1 ? "day" : "days";

const dates = (r: TimeOffRequest) =>
  r.startDate === r.endDate
    ? formatDisplayDate(r.startDate, { style: "medium" })
    : `${formatDisplayDate(r.startDate, { style: "medium" })} – ${formatDisplayDate(r.endDate, { style: "medium" })}`;

/**
 * The reader's own leave: what is left on each policy, and the next leave booked or asked for. Request Time Off
 * opens the request form on the reader's own time-off tab (`?request=1`), where their balances already are.
 */
export const MyLeaveWidget: React.FC = () => {
  const { userId } = useCurrentUser();
  const settings = useUserSettings();
  const canRequest = useCanAccess("PEOPLE.TIME_OFF", "EDIT");
  const balances = useEmployeeTimeOffBalancesByUser({ userId: userId ?? "" });
  const policies = useTimeOffPolicies();
  const requests = useTimeOffRequestsByUser({ userId: userId ?? "" });

  const today = isoDateInZone(new Date(), settings.data?.companyTimeZone);
  const policyMap = new Map((policies.data ?? []).map((policy) => [policy.id, policy]));
  const current = currentBalances(balances.data ?? [], today);
  const upcoming = (requests.data ?? [])
    .filter((r) => HOLDING.has(r.status) && r.endDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, UPCOMING_LIMIT);

  const action = canRequest && userId && current.length > 0
    ? <HomeCardLink href={`/organization/people/${userId}/time-off?request=1`}>Request Time Off</HomeCardLink>
    : undefined;

  if (!userId || balances.isLoading || policies.isLoading || requests.isLoading) {
    return (
      <HomeCard title="My Time Off">
        <HomeRowsSkeleton rows={2} avatar={false} />
      </HomeCard>
    );
  }
  const error = balances.error ?? requests.error;
  if (error) {
    return (
      <HomeCard title="My Time Off">
        <ErrorState error={error} compact onRetry={() => void (balances.error ? balances.refetch() : requests.refetch())} />
      </HomeCard>
    );
  }

  return (
    <HomeCard title="My Time Off" action={action}>
      {current.length === 0 ? (
        <HomeEmpty>No time-off policy applies to you yet.</HomeEmpty>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {current.map((balance) => {
            const policy = policyMap.get(balance.policyId);
            return (
              <li key={balance.id} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate text-brown-800">{policy?.name ?? "Time Off"}</span>
                <span className="shrink-0 text-muted-foreground">
                  <span className="font-semibold text-brown-900">{formatDayAmount(balance.currentBalance)}</span>{" "}
                  {unitOf(policy, balance.currentBalance)} left
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {upcoming.length > 0 && (
        <div className="flex flex-col gap-1 border-t border-brown-100 pt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-brown-400">Coming Up</p>
          {upcoming.map((request) => (
            <p key={request.id} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate text-brown-800">{dates(request)}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {request.status === "APPROVED" ? policyMap.get(request.policyId)?.name ?? "Approved" : "Waiting for Approval"}
              </span>
            </p>
          ))}
        </div>
      )}
    </HomeCard>
  );
};
