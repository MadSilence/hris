"use client";

import { useBalanceAsOf } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/hooks/useBalanceAsOf";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { formatDayAmount } from "@/models/timeOff/formatDayAmount";
import { formatDisplayDate } from "@/lib/date";
import { FC, useMemo } from "react";

import { cn } from "@/public/desact/src/components/ui/utils";
import { useEmployeeTimeOffBalanceTransactions } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/hooks/useEmployeeTimeOffBalanceTransactions";
import { TimeOffBalanceTransactionType } from "@/api/modules/timeOff/employeeTimeOffBalances/dto";

type Props = {
  balanceId: string;
  /** The end of the balance's period, when it has one — what the projection is asked about. */
  periodEnd?: string | null;
};

const signed = (n: number) => `${n > 0 ? "+" : ""}${formatDayAmount(n)}`;

const TYPE_LABEL: Record<TimeOffBalanceTransactionType, string> = {
  [TimeOffBalanceTransactionType.Accrual]: "Accrual",
  [TimeOffBalanceTransactionType.Usage]: "Time off",
  [TimeOffBalanceTransactionType.Adjustment]: "Adjustment",
  [TimeOffBalanceTransactionType.Carryover]: "Carryover",
  [TimeOffBalanceTransactionType.Expiry]: "Expiry",
  [TimeOffBalanceTransactionType.Reversal]: "Reversal",
};

/**
 * Read-only accrual/deduction ledger for a single balance. Entries arrive oldest-first; a running
 * balance is accumulated in that order, then the list is shown newest-first.
 */
export const BalanceLedger: FC<Props> = ({ balanceId, periodEnd }) => {
  const { data: transactions, isLoading } = useEmployeeTimeOffBalanceTransactions({ balanceId });
  // "How many days will I have at the end of the period?" — the endpoint that answered it had no
  // caller anywhere, so the ledger showed what has happened and nothing about what will.
  const { data: projection } = useBalanceAsOf(balanceId, periodEnd ?? "");

  const rows = useMemo(() => {
    let running = 0;
    const chronological = (transactions ?? []).map((t) => {
      running += t.amount;
      return { t, running };
    });
    return chronological.reverse();
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="space-y-1">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    );
  }

  const projectionRow = projection && (
    <div className="flex items-center justify-between rounded-lg border border-dashed border-brown-200 px-3 py-2 text-sm">
      <span className="text-muted-foreground">
        Projected on {formatDisplayDate(periodEnd, { style: "medium" })}
      </span>
      <span className="font-medium text-brown-900">
        {formatDayAmount(projection.balance)}
      </span>
    </div>
  );

  if (rows.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No ledger entries yet.</p>;
  }

  return (
    <div className="space-y-2">
      {projectionRow}

      <div className="divide-y divide-brown-100">
      {rows.map(({ t, running }) => (
        <div key={t.id} className="flex items-center justify-between gap-3 py-2">
          <div className="min-w-0">
            <p className="text-sm text-foreground">
              {TYPE_LABEL[t.type]}
              {t.reason ? <span className="text-muted-foreground"> · {t.reason}</span> : null}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDisplayDate(t.effectiveDate, { style: "medium" })}
            </p>
          </div>
          <div className="flex items-baseline gap-3 text-right">
            <span className={cn("text-sm font-medium", t.amount < 0 ? "text-red-600" : "text-green-700")}>
              {signed(t.amount)}
            </span>
            <span className="w-12 text-xs text-muted-foreground">{formatDayAmount(running)}</span>
          </div>
        </div>
      ))}
    </div>
      </div>
  );
};

export default BalanceLedger;
