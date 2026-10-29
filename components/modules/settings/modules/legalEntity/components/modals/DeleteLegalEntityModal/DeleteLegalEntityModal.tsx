"use client";

import { FC } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/public/desact/src/components/ui/alert-dialog";
import { LegalEntity } from "@/models/legalEntity";
import type { DetachedPeopleImpact } from "@/models/user/DetachedPeopleImpact";
import { DetachedPeopleNotice } from "@/components/modules/settings/shared/DetachedPeopleNotice";

type DeleteLegalEntityModalProps = {
  isOpen: boolean;
  isLoading?: boolean;
  onConfirmAction: () => void;
  onRequestCloseAction: () => void;
  entity: LegalEntity;
  /** Who deleting detaches. Without it the dialog falls back to the count the entity row carries. */
  impact?: DetachedPeopleImpact;
  impactLoading?: boolean;
  impactError?: boolean;
};

/**
 * The same shape as the office's delete (`DeleteOfficeModal`): one flow, one dialog. The two had a
 * question title on one side and an icon, a heading and a "Warning" block on the other (SWEEP S6).
 */
export const DeleteLegalEntityModal: FC<DeleteLegalEntityModalProps> = ({
  isOpen,
  isLoading = false,
  onConfirmAction,
  onRequestCloseAction,
  entity,
  impact,
  impactLoading,
  impactError,
}) => {
  const asked = impact !== undefined || impactLoading || impactError;
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onRequestCloseAction()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Permanently delete &quot;{entity?.name ?? ""}&quot; legal entity?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This legal entity will be permanently removed from the system. This action cannot be undone.
            {asked
              ? null
              : entity?.assignedUsersCount
                ? ` ${entity.assignedUsersCount} ${entity.assignedUsersCount === 1 ? "person" : "people"} currently assigned to it will lose that assignment.`
                : " Anyone currently assigned to it will lose that assignment."}
          </AlertDialogDescription>
          {asked ? (
            <DetachedPeopleNotice impact={impact} isLoading={impactLoading} isError={impactError} noun="legal entity" />
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* No onClick on Cancel: AlertDialogCancel already closes the dialog, which fires onOpenChange. */}
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading || impactLoading}
            className="bg-danger-600 text-white hover:bg-danger-700"
            onClick={(event) => {
              event.preventDefault();
              onConfirmAction();
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
