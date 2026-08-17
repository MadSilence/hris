"use client";

import { FC, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import {
  useAdjustEmployeeTimeOffBalance,
} from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/hooks/useAdjustEmployeeTimeOffBalance";
import {
  getEmployeeTimeOffBalanceTransactionsQueryKey,
} from "@/components/modules/settings/modules/time/timeOff/utils";

type Props = {
  userId: string;
  balanceId: string;
  /** "d" or "h" — shown next to the amount so the number is unambiguous. */
  unit: string;
};

/**
 * Manual credit/deduction against one balance. Extracted so the balances preview on the profile and
 * the balance detail dialog use the same form instead of two copies drifting apart.
 */
export const BalanceAdjustmentForm: FC<Props> = ({ userId, balanceId, unit }) => {
  const queryClient = useQueryClient();
  const adjustMutation = useAdjustEmployeeTimeOffBalance();

  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAdjust = async () => {
    const value = Number(amount);

    if (!amount.trim() || !Number.isFinite(value) || value === 0) {
      setError("Enter a non-zero amount (use a minus for a deduction).");
      return;
    }

    if (!reason.trim()) {
      setError("Please add a reason.");
      return;
    }

    setError(null);

    try {
      await adjustMutation.mutateAsync({
        balanceId,
        userId,
        adjustmentAmount: value,
        reason: reason.trim(),
      });

      await queryClient.invalidateQueries({
        queryKey: getEmployeeTimeOffBalanceTransactionsQueryKey(balanceId),
      });

      setAmount("");
      setReason("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to adjust the balance.");
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-brown-200 p-3.5">
      <p className="text-sm font-medium text-foreground">Manual adjustment</p>

      <div className="flex items-end gap-2">
        <div className="w-28 space-y-1.5">
          <Label htmlFor={`adj-amount-${balanceId}`} className="text-xs">
            Amount ({unit})
          </Label>
          <Input
            id={`adj-amount-${balanceId}`}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.currentTarget.value)}
            placeholder="e.g. -1"
            disabled={adjustMutation.isPending}
          />
        </div>

        <div className="flex-1 space-y-1.5">
          <Label htmlFor={`adj-reason-${balanceId}`} className="text-xs">Reason</Label>
          <Input
            id={`adj-reason-${balanceId}`}
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
            placeholder="Why?"
            disabled={adjustMutation.isPending}
          />
        </div>

        <Button onClick={handleAdjust} disabled={adjustMutation.isPending}>
          Apply
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <p className="text-xs text-muted-foreground">
        Use a negative amount to deduct. This adds an entry to the ledger.
      </p>
    </div>
  );
};
