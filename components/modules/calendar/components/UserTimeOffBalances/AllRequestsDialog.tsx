"use client";

import { FC, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowDown01Icon, CancelCircleIcon, Message01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/desact/dialog";
import { ChoiceMenu } from "@/components/desact/choice-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/desact/tooltip";
import { PolicyMarker } from "@/components/ui/PolicyMarker";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { cn } from "@/lib/cn";
import { dateToISO, useShortDates } from "@/lib/date";
import type { TimeOffPolicy, TimeOffRequest } from "@/models/timeOff";
import { TimeOffRequestStatus } from "@/api/modules/timeOff/timeOffRequests/dto";
import { CancelLeaveRequestDialog, useLeaveStatus } from "@/components/modules/timeOff";
import { lengthOf, requestUnitOf } from "@/components/modules/timeOff/lib/leaveWords";

const LIVE = new Set<string>([TimeOffRequestStatus.Pending, TimeOffRequestStatus.Approved, TimeOffRequestStatus.CancellationPending]);
const ALL = "ALL";

/**
 * **All requests** (profile-time-off Q29): Policy and Status on top; then the list — **Coming up** first, then each
 * year with the days taken in it; each row marker · dates · policy · length · status, Declined included; it scrolls
 * inside, max 520. A row opens the request in full in its place (Q29b, with ‹ back).
 *
 * A waiting request shows the red **×** on hover — always on a touch screen — "Cancel request", into the confirm (Q31).
 * Nothing else is done from the row: every other action is inside the request in full (AQ-16).
 */
export const AllRequestsDialog: FC<{
  userId: string;
  requests: TimeOffRequest[];
  policyMap: Map<string, TimeOffPolicy>;
  /** The person's first name, for the confirm's words on somebody else's request. */
  firstName: string | null;
  /** Hidden while a request is open in its place. */
  open: boolean;
  onOpenRequest: (requestId: string) => void;
  onClose: () => void;
}> = ({ userId, requests, policyMap, firstName, open, onOpenRequest, onClose }) => {
  const t = useTranslations("leave");
  const tCalendar = useTranslations("calendar");
  const shortDates = useShortDates();
  const statusOf = useLeaveStatus();
  const todayISO = dateToISO(new Date());

  const { userId: me } = useCurrentUser();
  const own = me === userId;
  const [policyFilter, setPolicyFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [confirming, setConfirming] = useState<TimeOffRequest | null>(null);

  const policies = useMemo(() => {
    const ids = [...new Set(requests.map((r) => r.policyId))];
    return ids.map((id) => ({ id, name: policyMap.get(id)?.name ?? tCalendar("balances.fallbackName") }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [requests, policyMap, tCalendar]);

  const filtered = requests.filter((r) =>
    (policyFilter === ALL || r.policyId === policyFilter) && (statusFilter === ALL || r.status === statusFilter));
  const comingUp = filtered.filter((r) => LIVE.has(r.status) && r.endDate >= todayISO)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const comingIds = new Set(comingUp.map((r) => r.id));
  const byYear = new Map<number, TimeOffRequest[]>();
  for (const r of filtered.filter((x) => !comingIds.has(x.id)).sort((a, b) => b.startDate.localeCompare(a.startDate))) {
    const year = Number(r.startDate.slice(0, 4));
    byYear.set(year, [...(byYear.get(year) ?? []), r]);
  }

  const row = (r: TimeOffRequest) => {
    const policy = policyMap.get(r.policyId);
    const status = statusOf(r.status);
    const cancellable = r.status === TimeOffRequestStatus.Pending;
    return (
      <div key={r.id} className="border-b border-divider">
        <div
          role="button"
          tabIndex={0}
          onClick={() => onOpenRequest(r.id)}
          onKeyDown={(e) => { if (e.key === "Enter") onOpenRequest(r.id); }}
          className="group grid h-12 cursor-pointer grid-cols-[minmax(0,200px)_minmax(0,140px)_120px_24px_1fr_auto] items-center gap-3 px-1 text-body hover:bg-subtle"
        >
          <span className="flex min-w-0 items-center gap-2">
            <PolicyMarker color={policy?.color} />
            <span className="truncate font-medium text-primary">
              {shortDates.range(r.startDate, r.endDate, { weekday: true })}
            </span>
          </span>
          <span className="truncate text-secondary">{policy?.name ?? tCalendar("balances.fallbackName")}</span>
          <span className="text-secondary tabular-nums">{lengthOf(t, r.requestedAmount, requestUnitOf(policy, r.countingMode))}</span>
          <span className="text-tertiary">
            {r.reason ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span aria-label={t("all.hasNote")} className="inline-flex"><Icon icon={Message01Icon} size="sm" /></span>
                </TooltipTrigger>
                <TooltipContent>{r.reason}</TooltipContent>
              </Tooltip>
            ) : null}
          </span>
          <span className="flex justify-end">
            <StatusBadge status={status.tone} label={status.label} />
          </span>
          <span className="flex w-9 items-center justify-end" onClick={(e) => e.stopPropagation()}>
            {cancellable ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label={t("all.cancelRequest")}
                          className="text-danger-text opacity-0 group-hover:opacity-100 focus-visible:opacity-100 touch:opacity-100"
                          onClick={() => setConfirming(r)}>
                    <Icon icon={CancelCircleIcon} size="sm" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("all.cancelRequest")}</TooltipContent>
              </Tooltip>
            ) : null}
          </span>
        </div>
      </div>
    );
  };

  const yearTaken = (rows: TimeOffRequest[]) =>
    lengthOf(t, rows.filter((r) => r.status === TimeOffRequestStatus.Approved).reduce((s, r) => s + r.requestedAmount, 0), "days");

  const filteredOut = policyFilter !== ALL || statusFilter !== ALL;

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
        <DialogContent size="lg" aria-describedby={undefined} className="max-h-[calc(100vh-2rem)] grid-rows-[auto_auto_minmax(0,1fr)] gap-4">
          <DialogTitle className="font-heading">{t("all.title")}</DialogTitle>

          <div className="flex flex-wrap items-center gap-2">
            <FilterMenu
              label={t("all.policy")}
              value={policyFilter}
              onChange={setPolicyFilter}
              options={[{ value: ALL, label: t("all.anyPolicy") }, ...policies.map((p) => ({ value: p.id, label: p.name }))]}
            />
            <FilterMenu
              label={t("all.status")}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: ALL, label: t("all.anyStatus") },
                ...Object.values(TimeOffRequestStatus).map((s) => ({ value: s, label: statusOf(s).label })),
              ]}
            />
          </div>

          <div className="scroll-thumb max-h-[520px] min-h-0 overflow-y-auto pb-6 [mask-image:linear-gradient(to_bottom,black_calc(100%-24px),transparent)]">
            {filtered.length === 0 ? (
              <p className="py-6 text-center text-body text-tertiary">{filteredOut ? t("all.emptyFiltered") : t("all.empty")}</p>
            ) : null}
            {comingUp.length > 0 ? (
              <section>
                <p className="pb-1 text-hint font-medium text-tertiary">{t("all.comingUp")}</p>
                {comingUp.map(row)}
              </section>
            ) : null}
            {[...byYear.entries()].map(([year, rows]) => (
              <section key={year}>
                <p className="flex items-center gap-2.5 pt-4 pb-1">
                  <span className="inline-flex h-[22px] items-center rounded-pill bg-mist px-2 text-hint font-semibold text-secondary">{year}</span>
                  <span className="text-label font-normal text-tertiary">{t("history.yearTaken", { length: yearTaken(rows) })}</span>
                </p>
                {rows.map(row)}
              </section>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <CancelLeaveRequestDialog
        request={confirming}
        policy={confirming ? policyMap.get(confirming.policyId) : undefined}
        own={own}
        firstName={firstName}
        onClose={() => setConfirming(null)}
      />
    </>
  );
};

/** A filter on the list as a pill with a menu of its values; "Any …" clears it. */
const FilterMenu: FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}> = ({ label, value, onChange, options }) => {
  const picked = value !== ALL ? options.find((o) => o.value === value)?.label : null;
  return (
    <ChoiceMenu
      label={label}
      options={options}
      value={value}
      onChange={onChange}
      className="max-h-80 w-auto min-w-48"
      trigger={
        <Button type="button" variant="secondary" size="sm" className={cn("rounded-pill", picked && "border-accent text-accent-text")}>
          {picked ?? label}
          <Icon icon={ArrowDown01Icon} size="sm" />
        </Button>
      }
    />
  );
};
