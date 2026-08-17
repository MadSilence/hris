"use client";

import { FC, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { cn } from "@/public/desact/src/components/ui/utils";

import { useEmployeeTimeOffBalanceTransactions } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/hooks/useEmployeeTimeOffBalanceTransactions";
import { BalanceAdjustmentForm } from "./BalanceAdjustmentForm";
import { TimeOffBalanceTransactionType } from "@/api/modules/timeOff/employeeTimeOffBalances/dto";
import { TimeOffPolicyUnit } from "@/api/modules/timeOff/timeOffPolicies/dto";
import type { EmployeeTimeOffBalance, TimeOffPolicy } from "@/models/timeOff";

type Props = {
  isOpen: boolean;
  userId: string;
  balance: EmployeeTimeOffBalance;
  policy?: TimeOffPolicy;
  onCloseAction: () => void;
};

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

export const BalanceDetailModal: FC<Props> = ({ isOpen, userId, balance, policy, onCloseAction }) => {
  const { data: transactions, isLoading } = useEmployeeTimeOffBalanceTransactions({
    balanceId: balance.id,
  });

  const unit = policy?.unit === TimeOffPolicyUnit.Hours ? "h" : "d";
  const name = policy?.displayName ?? "Time off";
  const granted =
    balance.openingBalance +
    balance.accruedBalance +
    balance.carriedOverBalance +
    balance.adjustedBalance;

  // Running balance over the ledger (entries come oldest-first), newest shown on top.
  const rows = useMemo(() => {
    let running = 0;
    const chronological = (transactions ?? []).map((t) => {
      running += t.amount;
      return { t, running };
    });
    return chronological.reverse();
  }, [transactions]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onCloseAction(); }}>
      <DialogContent hideClose className="max-w-lg overflow-hidden p-0">
        <DialogHeader className="border-b border-brown-100 bg-brown-50/40 px-6 py-5">
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>
            {policy?.unlimitedQuota
              ? `${fmt(balance.usedBalance)} ${unit} used · ${balance.year}`
              : `${fmt(balance.currentBalance)} ${unit} left of ${fmt(granted)} · ${balance.year}`}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
          <BalanceAdjustmentForm userId={userId} balanceId={balance.id} unit={unit}/>

          {/* Ledger history */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-brown-400">History</p>
            {isLoading ? (
              <div className="space-y-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-9 animate-pulse rounded bg-brown-50" />
                ))}
              </div>
            ) : rows.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No ledger entries yet.</p>
            ) : (
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
            )}
          </div>
        </div>

        <div className="flex justify-end border-t border-brown-100 px-6 py-4">
          <Button variant="outline" onClick={onCloseAction}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
