"use client";

import { FC, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { FormError } from "@/components/feedback/FormError";

import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import {
  useAdjustEmployeeTimeOffBalance,
} from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/hooks/useAdjustEmployeeTimeOffBalance";
import {
  getEmployeeTimeOffBalanceTransactionsQueryKey,
} from "@/components/modules/settings/modules/time/timeOff/utils";

type Props = {
  userId: string;
  balanceId: string;
  /** The unit's short label ("d" or "h") — shown next to the amount so the number is unambiguous. */
  unit: string;
};

/**
 * Manual credit/deduction against one balance. Extracted so the balances preview on the profile and
 * the balance detail dialog use the same form instead of two copies drifting apart.
 */
export const BalanceAdjustmentForm: FC<Props> = ({ userId, balanceId, unit }) => {
  const t = useTranslations("calendar");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();
  const adjustMutation = useAdjustEmployeeTimeOffBalance();

  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAdjust = async () => {
    const value = Number(amount);

    if (!amount.trim() || !Number.isFinite(value) || value === 0) {
      setError(t("adjustment.amountRequired"));
      return;
    }

    if (!reason.trim()) {
      setError(t("adjustment.reasonRequired"));
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
      setError(e instanceof Error ? e.message : t("adjustment.failed"));
    }
  };

  return (
    <div className="space-y-3 rounded-control border border-divider p-3.5">
      <p className="text-body font-medium text-primary">{t("adjustment.title")}</p>

      <div className="flex items-end gap-2">
        <div className="w-28 space-y-1.5">
          <Label htmlFor={`adj-amount-${balanceId}`} className="text-hint">
            {t("adjustment.amount", { unit })}
          </Label>
          <Input
            id={`adj-amount-${balanceId}`}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.currentTarget.value)}
            disabled={adjustMutation.isPending}
          />
        </div>

        <div className="flex-1 space-y-1.5">
          <Label htmlFor={`adj-reason-${balanceId}`} className="text-hint">{t("adjustment.reason")}</Label>
          <Input
            id={`adj-reason-${balanceId}`}
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
            disabled={adjustMutation.isPending}
          />
        </div>

        <Button type="button" onClick={handleAdjust} disabled={adjustMutation.isPending}>
          {tCommon("actions.apply")}
        </Button>
      </div>

      <FormError message={error}/>

      <p className="text-hint text-tertiary">
        {t("adjustment.hint")}
      </p>
    </div>
  );
};
