"use client";

import { useTimeOffAssignmentImpact } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyAssignments/hooks/useTimeOffAssignmentImpact";
import { dateToISO, isoToDate } from "@/lib/date";

import { FC, useMemo, useState } from "react";
import { Calendar03Icon, ShieldCheckIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { Label } from "@/components/desact/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/desact/popover";
import { Calendar } from "@/components/desact/calendar";
import { cn } from "@/lib/cn";

import { useCreateTimeOffPolicyAssignment } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyAssignments/hooks/useCreateTimeOffPolicyAssignment";
import { useInvalidateEmployeeTimeOffBalancesQuery } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/hooks/useEmployeeTimeOffBalancesByUser";
import { TimeOffPolicyStatus, TimeOffPolicyUnit } from "@/api/modules/timeOff/timeOffPolicies/dto";
import type { EmployeeTimeOffBalance, TimeOffPolicy } from "@/models/timeOff";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { FormError } from "@/components/feedback/FormError";
import { InlineAlert } from "@/components/desact/alert";

type Props = {
  isOpen: boolean;
  userId: string;
  policies: TimeOffPolicy[];
  /** The person's existing balances — one per active assignment, so they double as "already on". */
  balances: EmployeeTimeOffBalance[];
  onCloseAction: () => void;
};

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

  // What this assignment would produce, asked before it is made. Two things can be wrong with the
  // pair while both halves look right: the approval chain resolves to nobody for this person, and an
  // anniversary policy has no hire date to anchor on. Neither is visible on the policy screen.
  const { data: impact } = useTimeOffAssignmentImpact({
    policyId: policyId || null,
    userIds: useMemo(() => [userId], [userId]),
  });
  const chainWontResolve = (impact?.withoutApprover.length ?? 0) > 0;
  const noHireDate = (impact?.withoutHireDate.length ?? 0) > 0;

  const quotaLabel = selected
    ? selected.unlimitedQuota
      ? "Unlimited"
      : selected.yearlyQuota !== null
        ? `${selected.yearlyQuota} ${selected.unit === TimeOffPolicyUnit.Hours ? "h" : "d"} / year`
 : ""
 : "";

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
        <DialogHeader className="border-b border-divider bg-subtle/40 px-6 py-5 text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-popover border border-divider bg-card text-secondary">
              <Icon icon={ShieldCheckIcon} />
            </div>
            <div>
              <DialogTitle className="text-section-title">Assign a time-off policy</DialogTitle>
              <DialogDescription>
                The opening balance is granted right away.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          {available.length === 0 ? (
            <p className="rounded-card border border-dashed border-divider px-4 py-8 text-center text-body text-tertiary">
              {policies.length === 0
                ? "No time-off policies exist yet."
                : "This person is already on every active policy."}
            </p>
          ) : (
            <>
              <div className="space-y-1.5">
                <RequiredLabel className="text-hint" required>Policy</RequiredLabel>
                <SearchableSelect
                  options={available.map((p) => ({ value: p.id, label: p.name }))}
                  value={policyId || null}
                  onChange={(v) => setPolicyId(v ?? "")}
                  placeholder="Select a policy"
                  disabled={createMutation.isPending}
                  clearable={false}
                />
              </div>

              {noHireDate && (
                <InlineAlert tone="declined">
                  This policy renews on the hire anniversary and this person has no hire date, so the
                  balance would never renew. Set a hire date first — the assignment will be refused
                  until then.
                </InlineAlert>
              )}

              {chainWontResolve && !noHireDate && (
                <InlineAlert tone="pending">
                  This policy&apos;s approval chain has nobody to sign for this person — it asks for a
                  manager, and none is set. The assignment will work; their requests will be refused
                  until somebody can approve them.
                </InlineAlert>
              )}

              <div className="space-y-1.5">
                <Label className="text-hint">Effective from</Label>
                <Popover open={fromPickerOpen} onOpenChange={setFromPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={createMutation.isPending}
                      className={cn("w-full justify-start font-normal")}
                    >
                      <Icon icon={Calendar03Icon} size="sm" />
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

              <div className="flex items-center justify-between rounded-card border border-divider bg-subtle/40 px-4 py-3 text-body">
                <span className="text-tertiary">Yearly entitlement</span>
                <span className="font-medium text-primary">{quotaLabel}</span>
              </div>
            </>
          )}

          {error && <FormError message={error} />}
        </div>

        <div className="flex justify-end gap-2 border-t border-divider px-6 py-4">
          <Button type="button" variant="secondary" onClick={onCloseAction} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button type="button"
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
