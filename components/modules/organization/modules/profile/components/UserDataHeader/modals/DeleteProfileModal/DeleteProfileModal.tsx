"use client";

import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/desact/alert-dialog";
import { Button } from "@/components/desact/button";
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
  const t = useTranslations("organization");
  const tCommon = useTranslations("common");
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
          <AlertDialogTitle>{t("profile.header.deleteProfile")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.rich("profile.delete.description", { name: fullName, b: (chunks) => <strong>{chunks}</strong> })}
            {/* Only while Terminate is on offer: for a person already terminated the advice points at
                a button that is not there (WALK_QUESTIONS § 17). */}
            {onTerminateInstead
              ? <>{" "}{t("profile.delete.terminateHint")}</>
              : null}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isLoading ? (
          <p className="m-0 text-body text-tertiary">{t("profile.delete.checking")}</p>
        ) : isError || !impact ? (
          <p className="m-0 text-body text-tertiary">{t("profile.delete.checkFailed")}</p>
        ) : (
          <div className="space-y-2 text-body">
            <p className="m-0 font-medium">{t("profile.delete.deletedTitle")}</p>
            <ul className="m-0 list-disc space-y-0.5 pl-5 text-tertiary">
              <li>{t("profile.delete.requestsAndBalances", { requests: impact.timeOffRequests, balances: impact.balances })}</li>
              <li>
                {t("profile.delete.assignments", {
                  policyAssignments: impact.policyAssignments,
                  assignmentRecords: impact.assignmentRecords,
                  jobHistory: impact.jobHistoryEntries,
                })}
              </li>
              <li>{t("profile.delete.processes", { count: impact.processesDeleted })}</li>
            </ul>
            <p className="m-0 font-medium">{t("profile.delete.keptTitle")}</p>
            <ul className="m-0 list-disc space-y-0.5 pl-5 text-tertiary">
              <li>{t("profile.delete.documents", { count: impact.documentsToTrash })}</li>
              <li>{t("profile.delete.approvals", { count: impact.approvalsSignedForOthers })}</li>
              <li>{t("profile.delete.journal")}</li>
            </ul>
            {impact.directReports > 0 ? (
              <p className="m-0 text-tertiary">
                {impact.reportsMoveTo
                  ? t("profile.delete.reportsMove", { count: impact.directReports, manager: impact.reportsMoveTo })
                  : t("profile.delete.reportsLeft", { count: impact.directReports })}
              </p>
            ) : null}
          </div>
        )}

        <FormError message={refusal ?? error} />

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isBusy}>{tCommon("actions.cancel")}</AlertDialogCancel>
          {onTerminateInstead ? (
            <Button type="button" variant="secondary" disabled={isBusy} onClick={onTerminateInstead}>
              {t("profile.delete.terminateInstead")}
            </Button>
          ) : null}
          <Button type="button"
            variant="destructive-confirm"
            disabled={isBusy || isLoading || Boolean(refusal)}
            onClick={onConfirm}
          >
            {isBusy ? tCommon("actions.deleting") : tCommon("actions.delete")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
