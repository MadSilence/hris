"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useCanAccess } from "@/components/auth/useAccess";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { useUserSettings } from "@/components/modules/firstRun/hooks";
import { type DateFormatter, useDateFormatter } from "@/lib/date";
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
import { PolicyMarker } from "@/components/ui/PolicyMarker";
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

/** The `unit` of `home.myTimeOff.left`. */
const unitOf = (policy: TimeOffPolicy | undefined) => (policy?.unit === TimeOffPolicyUnit.Hours ? "hours" : "days");

const dates = (r: TimeOffRequest, formatDisplayDate: DateFormatter) =>
  r.startDate === r.endDate
    ? formatDisplayDate(r.startDate, { style: "medium" })
    : `${formatDisplayDate(r.startDate, { style: "medium" })} – ${formatDisplayDate(r.endDate, { style: "medium" })}`;

/**
 * The reader's own leave: what is left on each policy, and the next leave booked or asked for. Request Time Off
 * opens the request form on the reader's own time-off tab (`?request=1`), where their balances already are.
 */
export const MyLeaveWidget: React.FC = () => {
  const t = useTranslations("home");
  const formatDisplayDate = useDateFormatter();
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
    ? <HomeCardLink href={`/organization/people/${userId}/time-off?request=1`}>{t("myTimeOff.requestTimeOff")}</HomeCardLink>
    : undefined;

  if (!userId || balances.isLoading || policies.isLoading || requests.isLoading) {
    return (
      <HomeCard title={t("widgets.myTimeOff.title")}>
        <HomeRowsSkeleton rows={2} avatar={false} />
      </HomeCard>
    );
  }
  const error = balances.error ?? requests.error;
  if (error) {
    return (
      <HomeCard title={t("widgets.myTimeOff.title")}>
        <ErrorState error={error} compact onRetry={() => void (balances.error ? balances.refetch() : requests.refetch())} />
      </HomeCard>
    );
  }

  return (
    <HomeCard title={t("widgets.myTimeOff.title")} action={action}>
      {current.length === 0 ? (
        <HomeEmpty>{t("myTimeOff.empty")}</HomeEmpty>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {current.map((balance) => {
            const policy = policyMap.get(balance.policyId);
            return (
              <li key={balance.id} className="flex items-center justify-between gap-3 text-body">
                <span className="flex min-w-0 items-center gap-2">
                  <PolicyMarker color={policy?.color} />
                  <span className="truncate text-primary">{policy?.name ?? t("myTimeOff.policyFallback")}</span>
                </span>
                <span className="shrink-0 text-tertiary">
                  {t.rich("myTimeOff.left", {
                    b: (chunks) => <span className="font-semibold text-primary">{chunks}</span>,
                    amount: formatDayAmount(balance.currentBalance),
                    count: balance.currentBalance,
                    unit: unitOf(policy),
                  })}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {upcoming.length > 0 && (
        <div className="flex flex-col gap-1 border-t border-divider pt-3">
          <p className="text-hint font-medium text-tertiary">{t("myTimeOff.comingUp")}</p>
          {upcoming.map((request) => (
            <p key={request.id} className="flex items-center justify-between gap-3 text-body">
              <span className="flex min-w-0 items-center gap-2">
                <PolicyMarker color={policyMap.get(request.policyId)?.color} />
                <span className="truncate text-primary">{dates(request, formatDisplayDate)}</span>
              </span>
              <span className="shrink-0 text-hint text-tertiary">
                {request.status === "APPROVED" ? policyMap.get(request.policyId)?.name ?? t("myTimeOff.approved") : t("myTimeOff.waiting")}
              </span>
            </p>
          ))}
        </div>
      )}
    </HomeCard>
  );
};
