"use client";

import { FC, FormEvent, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserMinus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { Textarea } from "@/public/desact/src/components/ui/textarea";
import { Switch } from "@/public/desact/src/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/public/desact/src/components/ui/select";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import type {
  TerminationImpactDTO,
  TerminationReason,
} from "@/api/modules/users/clients/hrisApiUsersClient";

const REASONS: { id: TerminationReason; label: string }[] = [
  { id: "VOLUNTARY", label: "Voluntary — the person resigned" },
  { id: "INVOLUNTARY", label: "Involuntary — let go by the company" },
  { id: "END_OF_CONTRACT", label: "End of contract" },
];

const today = () => new Date().toISOString().slice(0, 10);

export type TerminateSubmission = {
  lastWorkingDay: string;
  reason: TerminationReason;
  rehireEligible: boolean;
  note: string | null;
};

export interface TerminateEmploymentModalProps {
  isOpen: boolean;
  userId: string;
  fullName: string;
  isLoading?: boolean;
  errorMessage?: string | null;
  onCancelAction: () => void;
  onConfirmAction: (values: TerminateSubmission) => void;
}

/**
 * Termination is not a flag — it revokes access, ends time-off policies and moves the person's
 * reports. The dialog fetches that impact and states it before the button is pressed.
 */
export const TerminateEmploymentModal: FC<TerminateEmploymentModalProps> = ({
  isOpen,
  userId,
  fullName,
  isLoading = false,
  errorMessage,
  onCancelAction,
  onConfirmAction,
}) => {
  const { internalApiClient } = useAppDataContext();

  const [lastWorkingDay, setLastWorkingDay] = useState(today);
  const [reason, setReason] = useState<TerminationReason>("VOLUNTARY");
  const [rehireEligible, setRehireEligible] = useState(true);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setLastWorkingDay(today());
    setReason("VOLUNTARY");
    setRehireEligible(true);
    setNote("");
  }, [isOpen]);

  const { data: impact, isLoading: impactLoading } = useQuery<TerminationImpactDTO>({
    queryKey: ["TERMINATION_IMPACT", userId],
    enabled: isOpen,
    queryFn: () =>
      internalApiClient.get<TerminationImpactDTO>(`/users/${userId}/termination-impact`),
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || !lastWorkingDay) return;

    onConfirmAction({
      lastWorkingDay,
      reason,
      rehireEligible,
      note: note.trim() || null,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onCancelAction()}>
      <DialogContent hideClose className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <UserMinus className="h-5 w-5"/>
            </span>
            <div>
              <DialogTitle>Terminate employment</DialogTitle>
              <DialogDescription>
                {fullName} will be archived and lose access.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="last-working-day">Last working day</Label>
              <Input
                id="last-working-day"
                type="date"
                value={lastWorkingDay}
                disabled={isLoading}
                onChange={(e) => setLastWorkingDay(e.currentTarget.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Reason</Label>
              <Select
                value={reason}
                onValueChange={(v) => setReason(v as TerminationReason)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-brown-200 px-3 py-2.5">
            <div>
              <Label htmlFor="rehire-eligible" className="text-sm">Eligible for rehire</Label>
              <p className="text-xs text-muted-foreground">
                The first thing anyone asks when this person applies again.
              </p>
            </div>
            <Switch
              id="rehire-eligible"
              checked={rehireEligible}
              disabled={isLoading}
              onCheckedChange={setRehireEligible}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="termination-note">Note</Label>
            <Textarea
              id="termination-note"
              rows={2}
              value={note}
              placeholder="Optional — context for whoever reads this later"
              disabled={isLoading}
              onChange={(e) => setNote(e.currentTarget.value)}
            />
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3.5">
            <p className="mb-1.5 text-sm font-medium text-amber-900">What this will do</p>
            {impactLoading ? (
              <p className="text-sm text-amber-800">Checking…</p>
            ) : (
              <ul className="space-y-1 text-sm text-amber-800">
                <li>Status becomes Archived and the person loses access.</li>
                <li>{impact?.rolesToRevoke ?? 0} role(s) revoked.</li>
                <li>
                  {impact?.policyAssignmentsToEnd ?? 0} time-off policy assignment(s) ended.
                  Remaining balances are kept for the final settlement, not cleared.
                </li>
                <li>
                  {impact?.directReportsToReassign ?? 0} direct report(s) move to{" "}
                  {impact?.reportsMoveTo ? (
                    <strong>{impact.reportsMoveTo.name}</strong>
                  ) : (
                    <strong>no manager</strong>
                  )}
                  .
                </li>
              </ul>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isLoading} onClick={onCancelAction}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !lastWorkingDay}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isLoading ? "Terminating…" : "Terminate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
