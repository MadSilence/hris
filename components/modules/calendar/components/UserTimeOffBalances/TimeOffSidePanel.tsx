"use client";

import { FC, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import { SearchField } from "@/components/ui/SearchField";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useTimeOffRequestsByUser } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffRequestsByUser";
import { TimeOffRequestStatus } from "@/api/modules/timeOff/timeOffRequests/dto";
import { TimeOffPolicyUnit } from "@/api/modules/timeOff/timeOffPolicies/dto";
import type { EmployeeTimeOffBalance, TimeOffPolicy, TimeOffRequest } from "@/models/timeOff";
import { dayAmountArgs, formatDayAmount } from "@/models/timeOff/formatDayAmount";
import { type DateFormatter, dateToISO, useDateFormatter } from "@/lib/date";
import { TAG_CLASSES, toTagColor } from "@/lib/theme/tags";
import { cn } from "@/lib/cn";
import type { CalendarTranslator } from "@/components/modules/calendar/lib/i18n";

/** At most this many balances in the panel; the rest are one link away (design fixes of 2026-11-04, fix 4). */
const PANEL_BALANCES = 4;
const UPCOMING = 3;

/** One policy as the panel shows it: the balance of the period that is running today. */
export type PolicyStanding = {
  policyId: string;
  name: string;
  color: string | null | undefined;
  unlimited: boolean;
  unit: TimeOffPolicyUnit;
  left: number;
  used: number;
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
      color: policy?.leaveTypeColor,
      unlimited: policy?.unlimitedQuota ?? false,
      unit: policy?.unit ?? TimeOffPolicyUnit.Days,
      left: b.currentBalance,
      used: b.usedBalance,
    };
  });
};

/**
 * Which balances earn a place in the panel: a limited policy always (it has something left to say), an
 * unlimited one only once it has been used. Most used first. A primary policy would lead (Q13 of the plan).
 */
export const panelOrder = (standings: PolicyStanding[]): PolicyStanding[] =>
  standings
    .filter((s) => !s.unlimited || s.used > 0)
    .sort((a, b) => b.used - a.used || a.name.localeCompare(b.name));

const figureOf = (t: CalendarTranslator, s: PolicyStanding) => {
  const unit = s.unit === TimeOffPolicyUnit.Hours ? "hours" : "days";
  return s.unlimited
    ? { value: formatDayAmount(s.used), caption: t("sidePanel.taken", { unit, count: s.used }) }
    : { value: formatDayAmount(s.left), caption: t("sidePanel.left", { unit, count: s.left }) };
};

const Dot: FC<{ color: string | null | undefined }> = ({ color }) => (
  <span aria-hidden className={cn("size-2 shrink-0 rounded-pill", TAG_CLASSES[toTagColor(color)].dot)} />
);

const BalanceRow: FC<{ standing: PolicyStanding; compact?: boolean }> = ({ standing, compact = false }) => {
  const t = useTranslations("calendar");
  const figure = figureOf(t, standing);
  return (
    <div className={cn("flex items-center gap-2.5 border-divider [&+&]:border-t", compact ? "h-11" : "h-15")}>
      <Dot color={standing.color} />
      <span className="min-w-0 flex-1 truncate text-body font-medium text-primary" title={standing.name}>
        {standing.name}
      </span>
      {compact ? (
        standing.unlimited && standing.used === 0 ? (
          <span className="text-body text-tertiary">{t("sidePanel.onRequest")}</span>
        ) : (
          <span className="flex min-w-24 items-baseline justify-end gap-1.5 tabular-nums">
            <span className="text-body font-semibold text-primary">{figure.value}</span>
            <span className="w-16 text-hint text-tertiary">{figure.caption}</span>
          </span>
        )
      ) : (
        <span className="flex flex-col items-end">
          <span className="text-section-title tabular-nums text-primary">{figure.value}</span>
          <span className="text-hint text-tertiary">{figure.caption}</span>
        </span>
      )}
    </div>
  );
};

/** Every policy, searchable, split into those with a balance and those taken on request. */
const AllPoliciesDialog: FC<{ standings: PolicyStanding[]; onClose: () => void }> = ({ standings, onClose }) => {
  const t = useTranslations("calendar");
  const [query, setQuery] = useState("");
  const shown = standings
    .filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));
  const groups = [
    { key: "balance", title: t("sidePanel.withBalance"), items: shown.filter((s) => !s.unlimited) },
    { key: "onRequest", title: t("sidePanel.onRequest"), items: shown.filter((s) => s.unlimited) },
  ].filter((g) => g.items.length > 0);

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent size="sm" className="gap-4">
        <DialogHeader>
          <DialogTitle>{t("sidePanel.allPoliciesTitle")}</DialogTitle>
        </DialogHeader>
        <SearchField value={query} onChange={setQuery} placeholder={t("sidePanel.searchPolicies")} />
        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto">
          {groups.length === 0 ? (
            <p className="text-body text-tertiary">{t("sidePanel.noMatch", { query })}</p>
          ) : (
            groups.map((g) => (
              <section key={g.key}>
                <h4 className="mb-1 flex justify-between text-label text-tertiary">
                  <span>{g.title}</span>
                  <span className="tabular-nums">{g.items.length}</span>
                </h4>
                {g.items.map((s) => <BalanceRow key={s.policyId} standing={s} compact />)}
              </section>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const rangeLabel = (r: TimeOffRequest, formatDisplayDate: DateFormatter) =>
  r.startDate === r.endDate
    ? formatDisplayDate(r.startDate, { style: "medium" })
    : `${formatDisplayDate(r.startDate, { style: "medium" })} – ${formatDisplayDate(r.endDate, { style: "medium" })}`;

const UPCOMING_STATUSES = new Set<string>([
  TimeOffRequestStatus.Pending,
  TimeOffRequestStatus.Approved,
  TimeOffRequestStatus.CancellationPending,
]);

/**
 * The time off tab's side panel under its actions: the person's balances and what is coming up. Read-only —
 * the history and the ledger stay behind the panel's menu.
 */
export const TimeOffSidePanel: FC<{
  userId: string;
  balances: EmployeeTimeOffBalance[];
  policyMap: Map<string, TimeOffPolicy>;
}> = ({ userId, balances, policyMap }) => {
  const t = useTranslations("calendar");
  const formatDisplayDate = useDateFormatter();
  const tTimeOff = useTranslations("timeOff");
  const todayISO = useMemo(() => dateToISO(new Date()), []);
  const [allOpen, setAllOpen] = useState(false);
  const fallbackName = t("balances.fallbackName");
  const standings = useMemo(
    () => standingsOf(balances, policyMap, todayISO, fallbackName),
    [balances, policyMap, todayISO, fallbackName],
  );
  const ordered = useMemo(() => panelOrder(standings), [standings]);

  const { data: requests } = useTimeOffRequestsByUser({ userId, year: null, status: null });
  const upcoming = useMemo(
    () =>
      (requests ?? [])
        .filter((r) => UPCOMING_STATUSES.has(r.status) && r.endDate >= todayISO)
        .sort((a, b) => a.startDate.localeCompare(b.startDate))
        .slice(0, UPCOMING),
    [requests, todayISO],
  );

  return (
    <>
      {ordered.length > 0 && (
        <section>
          <h4 className="mb-1 text-label text-tertiary">{t("sidePanel.balances")}</h4>
          {ordered.slice(0, PANEL_BALANCES).map((s) => <BalanceRow key={s.policyId} standing={s} />)}
          {standings.length > PANEL_BALANCES && (
            <button
              type="button"
              onClick={() => setAllOpen(true)}
              className="flex h-10 w-full items-center justify-between border-t border-divider text-body font-medium text-accent-text"
            >
              {t("sidePanel.allPolicies", { count: standings.length })}
              <Icon icon={ArrowRight01Icon} size="sm" />
            </button>
          )}
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <h4 className="mb-1 text-label text-tertiary">{t("sidePanel.upcoming")}</h4>
          {upcoming.map((r) => {
            const policy = policyMap.get(r.policyId);
            const amount = formatDayAmount(r.requestedAmount);
            const amountLabel =
              policy?.unit === TimeOffPolicyUnit.Hours
                ? t("sidePanel.amountHours", { amount })
                : tTimeOff("amount.days", dayAmountArgs(r.requestedAmount));
            return (
              <div key={r.id} className="flex items-center gap-2.5 border-divider py-2.5 [&+&]:border-t">
                <Dot color={policy?.leaveTypeColor} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body text-primary">{rangeLabel(r, formatDisplayDate)}</p>
                  <p className="truncate text-hint text-tertiary">
                    {policy?.name ?? fallbackName} · {amountLabel}
                  </p>
                </div>
                <StatusBadge status={r.status === TimeOffRequestStatus.Approved ? "approved" : "pending"} />
              </div>
            );
          })}
        </section>
      )}

      {allOpen && <AllPoliciesDialog standings={standings} onClose={() => setAllOpen(false)} />}
    </>
  );
};
