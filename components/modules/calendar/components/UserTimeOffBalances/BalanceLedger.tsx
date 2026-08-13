"use client";

import { FC, useMemo } from "react";

import { cn } from "@/public/desact/src/components/ui/utils";
import { useEmployeeTimeOffBalanceTransactions } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/hooks/useEmployeeTimeOffBalanceTransactions";
import { TimeOffBalanceTransactionType } from "@/api/modules/timeOff/employeeTimeOffBalances/dto";

type Props = { balanceId: string };

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
const signed = (n: number) => `${n > 0 ? "+" : ""}${fmt(n)}`;

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
export const BalanceLedger: FC<Props> = ({ balanceId }) => {
  const { data: transactions, isLoading } = useEmployeeTimeOffBalanceTransactions({ balanceId });

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
          <div key={i} className="h-9 animate-pulse rounded bg-brown-50" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No ledger entries yet.</p>;
  }

  return (
    <div className="divide-y divide-brown-100">
      {rows.map(({ t, running }) => (
        <div key={t.id} className="flex items-center justify-between gap-3 py-2">
          <div className="min-w-0">
            <p className="text-sm text-foreground">
              {TYPE_LABEL[t.type]}
              {t.reason ? <span className="text-muted-foreground"> · {t.reason}</span> : null}
            </p>
            <p className="text-xs text-muted-foreground">{t.effectiveDate}</p>
          </div>
          <div className="flex items-baseline gap-3 text-right">
            <span className={cn("text-sm font-medium", t.amount < 0 ? "text-red-600" : "text-green-700")}>
              {signed(t.amount)}
            </span>
            <span className="w-12 text-xs text-muted-foreground">{fmt(running)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BalanceLedger;
