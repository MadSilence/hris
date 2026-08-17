"use client";

import { FC, useMemo, useState } from "react";
import { CalendarClock, Plus } from "lucide-react";

import { useEmployeeTimeOffBalancesByUser } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/hooks/useEmployeeTimeOffBalancesByUser";
import { useTimeOffPolicies } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies";
import { TimeOffPolicyUnit } from "@/api/modules/timeOff/timeOffPolicies/dto";
import { Button } from "@/public/desact/src/components/ui/button";
import type { EmployeeTimeOffBalance, TimeOffPolicy } from "@/models/timeOff";
import { BalanceDetailModal } from "./BalanceDetailModal";
import { RequestTimeOffModal } from "./RequestTimeOffModal";

type Props = { userId: string };

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

function BalanceCard({
  balance,
  policy,
  onOpen,
}: {
  balance: EmployeeTimeOffBalance;
  policy?: TimeOffPolicy;
  onOpen: () => void;
}) {
  const name = policy?.displayName ?? "Time off";
  const unit = policy?.unit === TimeOffPolicyUnit.Hours ? "h" : "d";
  const unlimited = policy?.unlimitedQuota ?? false;

  const granted =
    balance.openingBalance +
    balance.accruedBalance +
    balance.carriedOverBalance +
    balance.adjustedBalance;
  const used = balance.usedBalance;
  const pct = granted > 0 ? Math.min(Math.round((used / granted) * 100), 100) : 0;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="rounded-xl border border-brown-200 bg-white p-4 text-left transition-colors hover:border-brown-300 hover:bg-brown-50/40"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium text-brown-900" title={name}>
          {name}
        </p>
        <span className="rounded border border-brown-200 bg-brown-50 px-1.5 py-0.5 text-[10px] leading-none text-brown-500">
          {balance.year}
        </span>
      </div>

      <div className="mt-2 flex items-baseline gap-1.5">
        {unlimited ? (
          <span className="text-2xl font-semibold leading-none text-brown-900">Unlimited</span>
        ) : (
          <>
            <span className="text-2xl font-semibold leading-none text-brown-900">
              {fmt(balance.currentBalance)}
            </span>
            <span className="text-sm text-muted-foreground">{unit} left</span>
          </>
        )}
      </div>

      <p className="mt-1.5 text-xs text-muted-foreground">
        {unlimited ? `${fmt(used)} ${unit} used` : `${fmt(used)} used of ${fmt(granted)} ${unit}`}
      </p>

      {!unlimited && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-brown-100">
          <div className="h-full rounded-full bg-brown-400 transition-all" style={{ width: `${pct}%` }} />
        </div>
      )}
    </button>
  );
}

export const UserTimeOffBalances: FC<Props> = ({ userId }) => {
  const { data: balances, isLoading: balancesLoading } = useEmployeeTimeOffBalancesByUser({ userId });
  const { data: policies, isLoading: policiesLoading } = useTimeOffPolicies();

  const [selected, setSelected] = useState<EmployeeTimeOffBalance | null>(null);
  const [requesting, setRequesting] = useState(false);

  const policyMap = useMemo(
    () => new Map((policies ?? []).map((p) => [p.id, p])),
    [policies],
  );

  const isLoading = balancesLoading || policiesLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl border border-brown-200 bg-brown-50" />
        ))}
      </div>
    );
  }

  if (!balances || balances.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-brown-200 px-4 py-6 text-sm text-muted-foreground">
        <CalendarClock className="h-5 w-5 text-brown-400" />
        No time off balances yet. Assign a policy to this person to start tracking.
      </div>
    );
  }

  return (
    <>
      <div className="mb-3 flex justify-end">
        <Button size="sm" onClick={() => setRequesting(true)}>
          <Plus className="h-4 w-4" />
          Request time off
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {balances.map((balance) => (
          <BalanceCard
            key={balance.id}
            balance={balance}
            policy={policyMap.get(balance.policyId)}
            onOpen={() => setSelected(balance)}
          />
        ))}
      </div>

      {requesting && (
        <RequestTimeOffModal
          isOpen={requesting}
          userId={userId}
          balances={balances}
          policyMap={policyMap}
          onCloseAction={() => setRequesting(false)}
        />
      )}

      {selected && (
        <BalanceDetailModal
          isOpen={selected !== null}
          userId={userId}
          balance={selected}
          policy={policyMap.get(selected.policyId)}
          onCloseAction={() => setSelected(null)}
        />
      )}
    </>
  );
};

export default UserTimeOffBalances;
