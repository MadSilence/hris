"use client";

import { FC, useMemo, useState } from "react";
import { Wallet } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { cn } from "@/public/desact/src/components/ui/utils";

import { TimeOffPolicyUnit } from "@/api/modules/timeOff/timeOffPolicies/dto";
import type { EmployeeTimeOffBalance, TimeOffPolicy } from "@/models/timeOff";
import { BalanceLedger } from "./BalanceLedger";
import { BalanceAdjustmentForm } from "./BalanceAdjustmentForm";
import { useCanAccess } from "@/components/auth/useAccess";

type Props = {
  isOpen: boolean;
  userId: string;
  balances: EmployeeTimeOffBalance[];
  policyMap: Map<string, TimeOffPolicy>;
  onCloseAction: () => void;
};

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

const grantedOf = (b: EmployeeTimeOffBalance) =>
  b.openingBalance + b.accruedBalance + b.carriedOverBalance + b.adjustedBalance;

const BalanceItem: FC<{
  balance: EmployeeTimeOffBalance;
  policy?: TimeOffPolicy;
  selected: boolean;
  onSelect: () => void;
}> = ({ balance, policy, selected, onSelect }) => {
  const name = policy?.displayName ?? "Time off";
  const unit = policy?.unit === TimeOffPolicyUnit.Hours ? "h" : "d";
  const unlimited = policy?.unlimitedQuota ?? false;
  const granted = grantedOf(balance);
  const pct = granted > 0 ? Math.min(Math.round((balance.usedBalance / granted) * 100), 100) : 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-lg border p-3 text-left transition-colors",
        selected ? "border-brown-300 bg-brown-50" : "border-brown-200 hover:border-brown-300 hover:bg-brown-50/40",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium text-brown-900" title={name}>{name}</p>
        <span className="rounded border border-brown-200 bg-white px-1.5 py-0.5 text-[10px] leading-none text-brown-500">
          {balance.year}
        </span>
      </div>
      <div className="mt-1.5 text-sm">
        {unlimited ? (
          <span className="font-semibold text-brown-900">Unlimited</span>
        ) : (
          <>
            <span className="font-semibold text-brown-900">{fmt(balance.currentBalance)}</span>
            <span className="text-muted-foreground"> {unit} left</span>
          </>
        )}
      </div>
      {!unlimited && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-brown-100">
          <div className="h-full rounded-full bg-brown-400" style={{ width: `${pct}%` }} />
        </div>
      )}
    </button>
  );
};

/**
 * Read-only preview of the person's time-off standing: policy balances on the left, the accrual/
 * deduction ledger of the selected policy on the right. Re-homes the balances + history that used to
 * live inline on the tab, now behind a toolbar button.
 */
export const BalancesPreviewModal: FC<Props> = ({
  isOpen,
  userId,
  balances,
  policyMap,
  onCloseAction,
}) => {
  const [selectedId, setSelectedId] = useState(balances[0]?.id ?? "");
  // Crediting or deducting days by hand is a MANAGE action — same gate the endpoint applies.
  const canAdjust = useCanAccess("PEOPLE.TIME_OFF", "MANAGE");

  const selected = useMemo(
    () => balances.find((b) => b.id === selectedId) ?? balances[0],
    [balances, selectedId],
  );
  const selectedPolicy = selected ? policyMap.get(selected.policyId) : undefined;
  const unit = selectedPolicy?.unit === TimeOffPolicyUnit.Hours ? "h" : "d";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onCloseAction(); }}>
      <DialogContent hideClose className="max-w-3xl overflow-hidden p-0">
        <DialogHeader className="border-b border-brown-100 bg-brown-50/40 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brown-200 bg-white text-brown-600">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Time off balances</DialogTitle>
              <DialogDescription>Balances by policy and their accrual history.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-0 md:grid-cols-[260px_1fr]">
          {/* Balances list */}
          <div className="max-h-[60vh] space-y-2 overflow-y-auto border-b border-brown-100 p-4 md:border-b-0 md:border-r">
            {balances.map((b) => (
              <BalanceItem
                key={b.id}
                balance={b}
                policy={policyMap.get(b.policyId)}
                selected={selected?.id === b.id}
                onSelect={() => setSelectedId(b.id)}
              />
            ))}
          </div>

          {/* Ledger for the selected balance */}
          <div className="max-h-[60vh] overflow-y-auto p-5">
            {selected ? (
              <>
                <div className="mb-3">
                  <p className="text-sm font-medium text-brown-900">
                    {selectedPolicy?.displayName ?? "Time off"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedPolicy?.unlimitedQuota
                      ? `${fmt(selected.usedBalance)} ${unit} used · ${selected.year}`
                      : `${fmt(selected.currentBalance)} ${unit} left of ${fmt(grantedOf(selected))} · ${selected.year}`}
                  </p>
                </div>
                {canAdjust && (
                  <div className="mb-4">
                    <BalanceAdjustmentForm
                      userId={userId}
                      balanceId={selected.id}
                      unit={unit}
                    />
                  </div>
                )}

                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brown-400">History</p>
                <BalanceLedger balanceId={selected.id} />
              </>
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">No balances to show.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end border-t border-brown-100 px-6 py-4">
          <Button variant="outline" onClick={onCloseAction}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BalancesPreviewModal;
