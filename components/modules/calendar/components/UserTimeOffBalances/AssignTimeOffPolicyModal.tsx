"use client";

import { FC, useMemo, useState } from "react";
import { CalendarDays, ShieldCheck } from "lucide-react";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Label } from "@/public/desact/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/public/desact/src/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/public/desact/src/components/ui/popover";
import { Calendar } from "@/public/desact/src/components/ui/calendar";
import { cn } from "@/public/desact/src/components/ui/utils";

import { useCreateTimeOffPolicyAssignment } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyAssignments/hooks/useCreateTimeOffPolicyAssignment";
import { useInvalidateEmployeeTimeOffBalancesQuery } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/hooks/useEmployeeTimeOffBalancesByUser";
import { TimeOffPolicyStatus, TimeOffPolicyUnit } from "@/api/modules/timeOff/timeOffPolicies/dto";
import type { EmployeeTimeOffBalance, TimeOffPolicy } from "@/models/timeOff";

type Props = {
  isOpen: boolean;
  userId: string;
  policies: TimeOffPolicy[];
  /** The person's existing balances — one per active assignment, so they double as "already on". */
  balances: EmployeeTimeOffBalance[];
  onCloseAction: () => void;
};

const pad = (n: number) => String(n).padStart(2, "0");
const dateToISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const isoToDate = (iso: string) => new Date(`${iso}T00:00:00`);
const prettyISO = (iso: string) => format(isoToDate(iso), "MMM d, yyyy");

/**
 * Assigning a policy from the person's card rather than from the policy's own settings page. The
 * backend grants the opening balance as part of the same transaction, so the person can request
 * time off the moment this closes — which is why the balances list is refetched on success.
 */
export const AssignTimeOffPolicyModal: FC<Props> = ({
  isOpen,
  userId,
  policies,
  balances,
  onCloseAction,
}) => {
  const createMutation = useCreateTimeOffPolicyAssignment();
  const invalidateBalances = useInvalidateEmployeeTimeOffBalancesQuery();

  const [policyId, setPolicyId] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState(dateToISO(new Date()));
  const [fromPickerOpen, setFromPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A draft or archived policy cannot be assigned, and the backend rejects a second active
  // assignment to the same policy — so both are filtered out here instead of failing on submit.
  const assignedPolicyIds = useMemo(
    () => new Set(balances.map((b) => b.policyId)),
    [balances],
  );

  const available = useMemo(
    () =>
      policies.filter(
        (p) => p.status === TimeOffPolicyStatus.Active && !assignedPolicyIds.has(p.id),
      ),
    [policies, assignedPolicyIds],
  );

  const selected = available.find((p) => p.id === policyId);

  const quotaLabel = selected
    ? selected.unlimitedQuota
      ? "Unlimited"
      : selected.yearlyQuota !== null
        ? `${selected.yearlyQuota} ${selected.unit === TimeOffPolicyUnit.Hours ? "h" : "d"} / year`
        : "—"
    : "—";

  const handleSubmit = async () => {
    if (!policyId) {
      setError("Pick a policy to assign.");
      return;
    }
    setError(null);
    try {
      await createMutation.mutateAsync({
        policyId,
        userId,
        effectiveFrom,
        effectiveTo: null,
      });
      invalidateBalances();
      onCloseAction();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to assign the policy.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !createMutation.isPending) onCloseAction(); }}>
      <DialogContent hideClose className="max-w-lg overflow-hidden p-0">
        <DialogHeader className="border-b border-brown-100 bg-brown-50/40 px-6 py-5 text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brown-200 bg-white text-brown-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Assign a time-off policy</DialogTitle>
              <DialogDescription>
                The opening balance is granted right away.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          {available.length === 0 ? (
            <p className="rounded-lg border border-dashed border-brown-200 px-4 py-8 text-center text-sm text-muted-foreground">
              {policies.length === 0
                ? "No time-off policies exist yet."
                : "This person is already on every active policy."}
            </p>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs">Policy</Label>
                <Select
                  value={policyId}
                  onValueChange={setPolicyId}
                  disabled={createMutation.isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a policy" />
                  </SelectTrigger>
                  <SelectContent>
                    {available.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.displayName || p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Effective from</Label>
                <Popover open={fromPickerOpen} onOpenChange={setFromPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={createMutation.isPending}
                      className={cn("w-full justify-start font-normal")}
                    >
                      <CalendarDays className="h-4 w-4" />
                      {prettyISO(effectiveFrom)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={isoToDate(effectiveFrom)}
                      onSelect={(d) => {
                        if (!d) return;
                        setEffectiveFrom(dateToISO(d));
                        setFromPickerOpen(false);
                      }}
                      defaultMonth={isoToDate(effectiveFrom)}
                      numberOfMonths={1}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-brown-200 bg-brown-50/40 px-4 py-3 text-sm">
                <span className="text-muted-foreground">Yearly entitlement</span>
                <span className="font-medium text-brown-900">{quotaLabel}</span>
              </div>
            </>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-brown-100 px-6 py-4">
          <Button variant="outline" onClick={onCloseAction} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!policyId || createMutation.isPending || available.length === 0}
          >
            {createMutation.isPending ? "Assigning…" : "Assign policy"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignTimeOffPolicyModal;
