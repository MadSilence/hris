"use client";

import { formatDayAmount } from "@/models/timeOff/formatDayAmount";
import { FC, useMemo, useState } from "react";
import { Wallet01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { cn } from "@/lib/cn";

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


const grantedOf = (b: EmployeeTimeOffBalance) =>
  b.openingBalance + b.accruedBalance + b.carriedOverBalance + b.adjustedBalance;

const BalanceItem: FC<{
  balance: EmployeeTimeOffBalance;
  policy?: TimeOffPolicy;
  selected: boolean;
  onSelect: () => void;
}> = ({ balance, policy, selected, onSelect }) => {
  const name = policy?.name ?? "Time off";
  const unit = policy?.unit === TimeOffPolicyUnit.Hours ? "h" : "d";
  const unlimited = policy?.unlimitedQuota ?? false;
  const granted = grantedOf(balance);
  const pct = granted > 0 ? Math.min(Math.round((balance.usedBalance / granted) * 100), 100) : 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-control border p-3 text-left transition-colors",
        selected ? "border-accent-ring bg-accent-subtle" : "border-divider hover:border-field hover:bg-subtle",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-body font-medium text-primary" title={name}>{name}</p>
        <span className="rounded-tag border border-divider bg-card px-1.5 py-0.5 text-hint leading-none text-tertiary">
          {balance.year}
        </span>
      </div>
      <div className="mt-1.5 text-body">
        {unlimited ? (
          <span className="font-semibold text-primary">Unlimited</span>
        ) : (
          <>
            <span className="font-semibold text-primary">{formatDayAmount(balance.currentBalance)}</span>
            <span className="text-tertiary"> {unit} left</span>
          </>
        )}
      </div>

      {/* What the number is made of. "20 left" used to mean the same thing whether the missing days
          were taken or merely asked for, and whether five of them expire in March. */}
      {!unlimited && (balance.pendingBalance > 0 || balance.remainingCarryover > 0) && (
        <p className="mt-1 text-hint text-tertiary">
          {balance.pendingBalance > 0 && (
            <>
              {formatDayAmount(balance.pendingBalance)} awaiting a decision
            </>
          )}
          {balance.pendingBalance > 0 && balance.remainingCarryover > 0 && " · "}
          {balance.remainingCarryover > 0 && (
            <>{formatDayAmount(balance.remainingCarryover)} carried over</>
          )}
        </p>
      )}
      {!unlimited && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-pill bg-mist">
          <div className="h-full rounded-pill bg-strong" style={{ width: `${pct}%` }} />
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
      <DialogContent hideClose size="lg" className="overflow-hidden p-0">
        <DialogHeader className="border-b border-divider bg-subtle/40 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-popover border border-divider bg-card text-secondary">
              <Icon icon={Wallet01Icon} />
            </div>
            <div>
              <DialogTitle className="text-section-title">Time off balances</DialogTitle>
              <DialogDescription>Balances by policy and their accrual history.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-0 md:grid-cols-[260px_1fr]">
          {/* Balances list */}
          <div className="max-h-[60vh] space-y-2 overflow-y-auto border-b border-divider p-4 md:border-b-0 md:border-r">
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
                  <p className="text-body font-medium text-primary">
                    {selectedPolicy?.name ?? "Time off"}
                  </p>
                  <p className="text-hint text-tertiary">
                    {selectedPolicy?.unlimitedQuota
                      ? `${formatDayAmount(selected.usedBalance)} ${unit} used · ${selected.year}`
                      : `${formatDayAmount(selected.currentBalance)} ${unit} left of ${formatDayAmount(grantedOf(selected))} · ${selected.year}`}
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

                <p className="mb-2 text-hint font-semibold text-tertiary">History</p>
                <BalanceLedger balanceId={selected.id} periodEnd={selected.periodEnd} />
              </>
            ) : (
              <p className="py-6 text-center text-body text-tertiary">No balances to show.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end border-t border-divider px-6 py-4">
          <Button type="button" variant="secondary" onClick={onCloseAction}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BalancesPreviewModal;
