"use client";

import { FC, ReactNode, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import {
  Add01Icon,
  ArrowRight02Icon,
  Calendar03Icon,
  Clock01Icon,
  PencilEdit02Icon,
  Cancel01Icon,
  ArrowTurnBackwardIcon,
} from "@hugeicons/core-free-icons";
import { Icon, type IconSvgElement } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/desact/dialog";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { Skeleton } from "@/components/desact/skeleton";
import { FieldError } from "@/components/desact/field-error";
import { FormError } from "@/components/feedback/FormError";
import { Illustration } from "@/components/illustrations";
import { PolicyMarker } from "@/components/ui/PolicyMarker";
import { DatePicker } from "@/components/ui/DatePicker";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { cn } from "@/lib/cn";
import { dateToISO, useShortDates } from "@/lib/date";
import { showSuccess } from "@/lib/errors/errorToast";
import { formatDayAmount } from "@/models/timeOff/formatDayAmount";
import type { EmployeeTimeOffBalance, TimeOffPolicy, TimeOffRequest } from "@/models/timeOff";
import { TimeOffBalanceTransactionType, type EmployeeTimeOffBalanceTransactionDTO } from "@/api/modules/timeOff/employeeTimeOffBalances/dto";
import { TimeOffRequestStatus } from "@/api/modules/timeOff/timeOffRequests/dto";
import { getEmployeeTimeOffBalanceTransactionsQueryKey } from "@/components/modules/settings/modules/time/timeOff/utils";
import { employeeTimeOffBalancesService } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/services/employeeTimeOffBalancesService";
import { useAdjustEmployeeTimeOffBalance } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/hooks/useAdjustEmployeeTimeOffBalance";
import { balanceUnit, lengthOf, signedLengthOf, unitOf } from "@/components/modules/timeOff/lib/leaveWords";

const ICON: Record<TimeOffBalanceTransactionType, IconSvgElement> = {
  [TimeOffBalanceTransactionType.Usage]: Calendar03Icon,
  [TimeOffBalanceTransactionType.Adjustment]: PencilEdit02Icon,
  [TimeOffBalanceTransactionType.Carryover]: ArrowRight02Icon,
  [TimeOffBalanceTransactionType.Accrual]: Add01Icon,
  [TimeOffBalanceTransactionType.Expiry]: Cancel01Icon,
  [TimeOffBalanceTransactionType.Reversal]: ArrowTurnBackwardIcon,
};

type Row = { tx: EmployeeTimeOffBalanceTransactionDTO; running: number };
type Period = { balance: EmployeeTimeOffBalance; rows: Row[] };

/**
 * **A policy's balance history** (profile-time-off Q20, Q21, Q22, Q32), opened from a balance row: 800 wide; the
 * policy as the title (no person's name — the profile says whose); a grey card with what is left and **Adjust
 * balance** for whoever may (`PEOPLE.TIME_OFF` MANAGE, the endpoint's own gate); a request still waiting, apart on
 * top; then one line per change — Date · Change · Balance · What happened — newest first, every period of the policy
 * under its year's tag. With no limit: the days taken per year, no balance column, no Adjust (Q22).
 *
 * **A waiting request is not counted** (U7, AQ-03): "days left" is the balance, and a request still waiting is shown
 * apart, on top — "Waiting for approval · Time off · Mon 30 Nov – Fri 4 Dec · 5 days … Not counted yet". A hand
 * adjustment names who made it: "Adjusted by Ulia Tykoon: start date corrected" (B5).
 */
export const BalanceHistoryDialog: FC<{
  userId: string;
  policy: TimeOffPolicy | undefined;
  /** Every period of this policy the person has. */
  balances: EmployeeTimeOffBalance[];
  /** The one running today — what Adjust changes. */
  current: EmployeeTimeOffBalance | undefined;
  requests: TimeOffRequest[];
  canAdjust: boolean;
  /** The person's first name — the empty state names them; null on their own profile. */
  firstName: string | null;
  onClose: () => void;
}> = ({ userId, policy, balances, current, requests, canAdjust, firstName, onClose }) => {
  const t = useTranslations("leave");
  const tCalendar = useTranslations("calendar");
  const shortDates = useShortDates();
  const unit = balanceUnit(unitOf(policy));
  const unlimited = policy?.unlimitedQuota ?? false;
  const [adjusting, setAdjusting] = useState(false);

  const periods = useMemo(() => [...balances].sort((a, b) => b.periodStart.localeCompare(a.periodStart)), [balances]);
  const queries = useQueries({
    queries: periods.map((b) => ({
      queryKey: getEmployeeTimeOffBalanceTransactionsQueryKey(b.id),
      queryFn: () => employeeTimeOffBalancesService.listTransactions(b.id),
    })),
  });
  const loading = queries.some((q) => q.isLoading);

  const history: Period[] = periods.map((balance, i) => {
    let running = 0;
    const rows = (queries[i]?.data ?? []).map((tx) => {
      running += tx.amount;
      return { tx, running };
    });
    return { balance, rows: rows.reverse() };
  });

  const requestsById = useMemo(() => new Map(requests.map((r) => [r.id, r])), [requests]);
  const waiting = requests.filter((r) => r.policyId === policy?.id && r.status === TimeOffRequestStatus.Pending);
  const tookAny = history.some((p) => p.rows.some((r) => r.tx.type === TimeOffBalanceTransactionType.Usage));

  const what = (row: Row, balance: EmployeeTimeOffBalance): ReactNode => {
    const { tx } = row;
    switch (tx.type) {
      case TimeOffBalanceTransactionType.Usage: {
        const r = tx.sourceRef ? requestsById.get(tx.sourceRef) : undefined;
        return r
          ? t("history.usage", { dates: shortDates.range(r.startDate, r.endDate, { weekday: true }) })
          : t("history.usagePlain");
      }
      case TimeOffBalanceTransactionType.Adjustment:
        if (tx.createdByName) {
          return tx.reason
            ? t("history.adjustedBy", { name: tx.createdByName, reason: tx.reason })
            : t("history.adjustedByPlain", { name: tx.createdByName });
        }
        return tx.reason ? t("history.adjustment", { reason: tx.reason }) : t("history.adjustmentPlain");
      case TimeOffBalanceTransactionType.Carryover:
        return t("history.carriedOver", { year: String(balance.year - 1) });
      case TimeOffBalanceTransactionType.Accrual:
        return tx.reason ?? t("history.allowance");
      case TimeOffBalanceTransactionType.Expiry:
        return t("history.expiry");
      case TimeOffBalanceTransactionType.Reversal:
        return t("history.reversal");
    }
  };

  const yearNote = (p: Period, i: number): string | null => {
    if (unlimited) {
      const taken = p.rows.filter((r) => r.tx.type === TimeOffBalanceTransactionType.Usage)
        .reduce((sum, r) => sum - r.tx.amount, 0);
      return t("history.yearTaken", { length: lengthOf(t, taken, unit) });
    }
    if (i === 0 || p.balance === current) return null;
    const newer = history[i - 1]?.balance;
    const length = lengthOf(t, p.balance.currentBalance, unit);
    return newer && newer.carriedOverBalance > 0
      ? t("history.endedWithCarried", { length })
      : t("history.endedWith", { length });
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent size="lg" aria-describedby={undefined} className="max-h-[calc(100vh-2rem)] grid-rows-[auto_auto_minmax(0,1fr)] gap-4 overflow-hidden">
        <DialogTitle className="flex items-center gap-2 font-heading">
          <PolicyMarker color={policy?.color} />
          <span className="truncate">{policy?.name ?? tCalendar("balances.fallbackName")}</span>
        </DialogTitle>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 rounded-card bg-subtle px-5 py-4">
            <div className="flex-1">
              {unlimited ? (
                <>
                  <p className="font-heading text-number text-primary">{t("noLimit")}</p>
                  <p className="text-label font-normal text-tertiary">{t("history.takenWhenNeeded")}</p>
                </>
              ) : (
                <>
                  <p className="font-heading text-number tabular-nums text-primary">{formatDayAmount(current?.currentBalance ?? 0)}</p>
                  <p className="text-label font-normal text-tertiary">{t("left", { unit, count: current?.currentBalance ?? 0 })}</p>
                </>
              )}
            </div>
            {canAdjust && !unlimited && current && !adjusting ? (
              <Button type="button" variant="secondary" onClick={() => setAdjusting(true)}>{t("history.adjust")}</Button>
            ) : null}
          </div>

          {adjusting && current ? (
            <AdjustForm userId={userId} balance={current} unit={unit} onDone={() => setAdjusting(false)} />
          ) : null}

          {waiting.map((r) => (
            <div key={r.id} className="flex items-center gap-2 rounded-tint bg-status-pending-bg px-4 py-2.5 text-body">
              <Icon icon={Clock01Icon} size="sm" className="text-status-pending-icon" />
              <span className="font-medium text-status-pending-text">{t("history.waiting")}</span>
              <span className="min-w-0 flex-1 truncate text-primary">
                {t("history.waitingLine", {
                  dates: shortDates.range(r.startDate, r.endDate, { weekday: true }),
                  length: lengthOf(t, r.requestedAmount, unit),
                })}
              </span>
              <span className="shrink-0 text-status-pending-text">{t("history.notCounted")}</span>
            </div>
          ))}
        </div>

        <div className="scroll-thumb min-h-0 overflow-y-auto">
          <div className={cn("grid gap-x-4 border-b border-divider pb-2 text-hint font-medium text-tertiary",
            unlimited ? "grid-cols-[72px_88px_1fr]" : "grid-cols-[72px_88px_96px_1fr]")}>
            <span>{t("history.date")}</span>
            <span>{unlimited ? t("history.days") : t("history.change")}</span>
            {unlimited ? null : <span>{t("history.balance")}</span>}
            <span>{t("history.whatHappened")}</span>
          </div>

          {loading ? (
            <div className="flex flex-col gap-2 pt-3">
              {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-9 w-full" />)}
            </div>
          ) : (
            history.map((p, i) => {
              const note = yearNote(p, i);
              const rows = unlimited ? p.rows.filter((r) => r.tx.type === TimeOffBalanceTransactionType.Usage) : p.rows;
              if (rows.length === 0 && i > 0) return null;
              return (
                <section key={p.balance.id}>
                  <p className="flex items-center gap-2.5 pt-4 pb-2">
                    <span className="inline-flex h-[22px] items-center rounded-pill bg-mist px-2 text-hint font-semibold text-secondary">
                      {p.balance.year}
                    </span>
                    {note ? <span className="text-label font-normal text-tertiary">{note}</span> : null}
                  </p>
                  {rows.map((row) => (
                    <div key={row.tx.id}
                         className={cn("grid items-center gap-x-4 border-b border-divider py-3 text-body",
                           unlimited ? "grid-cols-[72px_88px_1fr]" : "grid-cols-[72px_88px_96px_1fr]")}>
                      <span className="text-tertiary">{shortDates.date(row.tx.effectiveDate, { hideYear: true })}</span>
                      <span className={cn("font-medium", row.tx.amount > 0 ? "text-status-approved-text" : "text-primary")}>
                        {unlimited ? lengthOf(t, row.tx.amount, unit) : signedLengthOf(t, row.tx.amount, unit)}
                      </span>
                      {unlimited ? null : <span className="text-secondary">{lengthOf(t, row.running, unit, row.running < 0 ? "−" : "")}</span>}
                      <span className="flex min-w-0 items-center gap-2 text-primary">
                        <Icon icon={ICON[row.tx.type]} size="sm" className="shrink-0 text-tertiary" />
                        <span className="truncate">{what(row, p.balance)}</span>
                      </span>
                    </div>
                  ))}
                </section>
              );
            })
          )}

          {!loading && !tookAny ? (
            <div className="flex flex-col items-center gap-1.5 pt-6 pb-12 text-center">
              <Illustration scene="time-off-m" size="m" />
              <p className="mt-2 text-card-title text-primary">{t("history.nothingTaken")}</p>
              <p className="text-body text-secondary">
                {firstName ? t("history.nothingTakenText", { name: firstName }) : t("history.nothingTakenTextOwn")}
              </p>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Adjusting by hand (Q21), inside the grey card's place: + or −, the days, the reason; "Balance after" follows as one
 * types; Cancel · Save. Saving adds a line to the history and says "Balance adjusted".
 */
const AdjustForm: FC<{
  userId: string;
  balance: EmployeeTimeOffBalance;
  unit: "hours" | "days";
  onDone: () => void;
}> = ({ userId, balance, unit, onDone }) => {
  const t = useTranslations("leave");
  const tCalendar = useTranslations("calendar");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();
  const adjust = useAdjustEmployeeTimeOffBalance();
  const [sign, setSign] = useState<"add" | "deduct">("add");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  // Today by default, past or future (Q21b): a past date takes its place in the history, a future one waits there.
  const [effectiveDate, setEffectiveDate] = useState(() => dateToISO(new Date()));
  const [tried, setTried] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  const value = Number(amount);
  const valid = amount.trim() !== "" && Number.isFinite(value) && value > 0;
  const delta = valid ? (sign === "add" ? value : -value) : 0;
  const after = balance.currentBalance + delta;

  const save = async () => {
    setTried(true);
    if (!valid || !reason.trim() || !effectiveDate) return;
    setError(null);
    setDateError(null);
    try {
      await adjust.mutateAsync({
        balanceId: balance.id,
        userId,
        adjustmentAmount: delta,
        reason: reason.trim(),
        effectiveDate,
      });
      await queryClient.invalidateQueries({ queryKey: getEmployeeTimeOffBalanceTransactionsQueryKey(balance.id) });
      showSuccess(t("history.adjusted"));
      onDone();
    } catch (e) {
      const message = e instanceof Error ? e.message : tCalendar("adjustment.failed");
      // A date outside the balance's period is the date's own fault: said under it (ETOBB00010).
      if (codeOf(e) === "ETOBB00010") setDateError(message);
      else setError(message);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-card border border-divider p-4">
      <div className="flex items-start gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="adjust-days">{t("history.days")}</Label>
          <div className="flex items-center gap-2">
            <SegmentedControl
              aria-label={t("history.days")}
              fill={false}
              value={sign}
              onChange={setSign}
              options={[
                { value: "add", label: <span aria-label={t("history.add")}>+</span> },
                { value: "deduct", label: <span aria-label={t("history.deduct")}>−</span> },
              ]}
            />
            <Input id="adjust-days" type="number" min={0} step="0.5" className="w-18" value={amount}
                   onChange={(e) => setAmount(e.currentTarget.value)} disabled={adjust.isPending} />
          </div>
          <FieldError>{tried && !valid ? t("history.amountRequired") : null}</FieldError>
        </div>
        <div className="flex w-39 shrink-0 flex-col gap-1.5">
          <Label htmlFor="adjust-date">{t("history.date")}</Label>
          <DatePicker
            id="adjust-date"
            value={effectiveDate}
            onChange={(v) => { setEffectiveDate(v); setDateError(null); }}
            disabled={adjust.isPending}
            clearable={false}
            invalid={Boolean(dateError) || (tried && !effectiveDate)}
          />
          <FieldError>{dateError ?? (tried && !effectiveDate ? tCommon("validation.required") : null)}</FieldError>
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="adjust-reason">{t("history.reason")}</Label>
          <Input id="adjust-reason" value={reason} onChange={(e) => setReason(e.currentTarget.value)} disabled={adjust.isPending} />
          <FieldError>{tried && !reason.trim() ? t("history.reasonRequired") : null}</FieldError>
        </div>
      </div>
      <FormError message={error} />
      <div className="flex items-center gap-2">
        <p className="mr-auto text-label font-normal text-secondary">
          {t.rich("history.after", {
            value: lengthOf(t, after, unit, after < 0 ? "−" : ""),
            b: (chunks) => <span className="font-medium text-primary">{chunks}</span>,
          })}
        </p>
        <Button type="button" variant="secondary" size="sm" onClick={onDone} disabled={adjust.isPending}>
          {tCommon("actions.cancel")}
        </Button>
        <Button type="button" size="sm" loading={adjust.isPending} onClick={() => void save()}>
          {tCommon("actions.save")}
        </Button>
      </div>
    </div>
  );
};

/** The backend's error code a refused action carried, when it did. */
const codeOf = (e: unknown): string | undefined =>
  typeof e === "object" && e !== null && "code" in e && typeof (e as { code: unknown }).code === "string"
    ? (e as { code: string }).code
    : undefined;
