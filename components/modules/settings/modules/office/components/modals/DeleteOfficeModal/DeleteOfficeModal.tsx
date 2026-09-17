"use client";

import React from "react";
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
import { Office } from "@/models/office";
import type { DetachedPeopleImpact } from "@/models/user/DetachedPeopleImpact";
import { DetachedPeopleNotice } from "@/components/modules/settings/shared/DetachedPeopleNotice";

type DeleteOfficeModalProps = {
  isOpen: boolean;
  isLoading?: boolean;
  onConfirmAction: () => void;
  onRequestCloseAction: () => void;
  office: Office;
  /** Who deleting detaches. Without it the dialog falls back to the count the office row carries. */
  impact?: DetachedPeopleImpact;
  impactLoading?: boolean;
  impactError?: boolean;
};

export const DeleteOfficeModal: React.FC<DeleteOfficeModalProps> = ({
  isOpen,
  isLoading = false,
  onConfirmAction,
  onRequestCloseAction,
  office,
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
            Permanently delete &quot;{office?.name ?? ""}&quot; office?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This office will be permanently removed from the system. This action cannot be undone.
            {asked
              ? null
              : office?.assignedUsersCount
                ? ` ${office.assignedUsersCount} ${office.assignedUsersCount === 1 ? "person" : "people"} currently assigned to this office will lose that assignment.`
                : " Anyone currently assigned to this office will lose that assignment."}
          </AlertDialogDescription>
          {asked ? (
            <DetachedPeopleNotice impact={impact} isLoading={impactLoading} isError={impactError} noun="office" />
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* No onClick on Cancel: AlertDialogCancel already closes the dialog, which fires
              onOpenChange — adding a handler here called onRequestCloseAction twice per click. */}
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isLoading || impactLoading} onClick={(event) => {
              event.preventDefault();
              onConfirmAction();
            }}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
