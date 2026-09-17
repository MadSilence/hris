"use client";

import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/public/desact/src/components/ui/alert-dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { FormError } from "@/components/feedback/FormError";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { messageForCode } from "@/lib/errors/errorMessages";
import type { PersonDeleteImpactDTO } from "@/api/modules/users/clients/hrisApiUsersClient";

type Props = {
  isOpen: boolean;
  userId: string;
  fullName: string;
  isBusy: boolean;
  error: string | null;
  /** Null when the person is already terminated: the alternative is not offered twice. */
  onTerminateInstead: (() => void) | null;
  onConfirm: () => void;
  onClose: () => void;
};

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/**
 * Delete is not Terminate, and the dialog is where that is said.
 *
 * Decided 2026-09-14: a person has two actions. Terminate ends the employment and keeps the history;
 * Delete removes the profile with it. So the dialog states what goes, what stays and what moves, with
 * the counts from the server, offers Terminate beside Delete, and — when the delete will be refused
 * (yourself, the last System Owner, a named approver) — says why before anybody presses anything.
 */
export const DeleteProfileModal: FC<Props> = ({
  isOpen, userId, fullName, isBusy, error, onTerminateInstead, onConfirm, onClose,
}) => {
  const { internalApiClient } = useAppDataContext();
  const { data: impact, isLoading, isError } = useQuery<PersonDeleteImpactDTO>({
    queryKey: ["PERSON_DELETE_IMPACT", userId],
    enabled: isOpen,
    staleTime: 0,
    retry: 1,
    queryFn: () => internalApiClient.get<PersonDeleteImpactDTO>(`/users/${userId}/delete-impact`),
  });

  const refusal = impact?.refusal
    ? messageForCode(impact.refusal, undefined, [impact.approverInPolicies.join(", ")])
    : null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => { if (!open && !isBusy) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">Delete Profile</AlertDialogTitle>
          <AlertDialogDescription>
            This deletes <strong>{fullName}</strong> and their history, and cannot be undone. If they
            are leaving, terminate the employment instead: that keeps the record and ends their access.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isLoading ? (
          <p className="m-0 text-sm text-muted-foreground">Checking what is attached to this profile…</p>
        ) : isError || !impact ? (
          <p className="m-0 text-sm text-muted-foreground">What is attached to this profile could not be checked.</p>
        ) : (
          <div className="space-y-2 text-sm">
            <p className="m-0 font-medium">Deleted with the profile</p>
            <ul className="m-0 list-disc space-y-0.5 pl-5 text-muted-foreground">
              <li>{plural(impact.timeOffRequests, "leave request", "leave requests")}, {plural(impact.balances, "balance", "balances")} and their history</li>
              <li>{plural(impact.policyAssignments, "policy assignment", "policy assignments")}, {plural(impact.assignmentRecords, "assignment record", "assignment records")}, {plural(impact.jobHistoryEntries, "job history entry", "job history entries")}</li>
              <li>{plural(impact.processesDeleted, "preboarding or onboarding process", "preboarding and onboarding processes")} run for them</li>
            </ul>
            <p className="m-0 font-medium">Kept</p>
            <ul className="m-0 list-disc space-y-0.5 pl-5 text-muted-foreground">
              <li>{plural(impact.documentsToTrash, "document goes", "documents go")} to the trash, not straight to erasure</li>
              <li>{plural(impact.approvalsSignedForOthers, "approval they signed", "approvals they signed")} in other people&apos;s requests, with their name</li>
              <li>The journal of what they did</li>
            </ul>
            {impact.directReports > 0 ? (
              <p className="m-0 text-muted-foreground">
                {plural(impact.directReports, "direct report moves", "direct reports move")} to {impact.reportsMoveTo ?? "no manager"}.
              </p>
            ) : null}
          </div>
        )}

        <FormError message={refusal ?? error} />

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isBusy}>Cancel</AlertDialogCancel>
          {onTerminateInstead ? (
            <Button variant="outline" disabled={isBusy} onClick={onTerminateInstead}>
              Terminate Instead
            </Button>
          ) : null}
          <Button
            className="bg-red-600 text-white hover:bg-red-700"
            disabled={isBusy || isLoading || Boolean(refusal)}
            onClick={onConfirm}
          >
            {isBusy ? "Deleting…" : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
