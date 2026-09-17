"use client";

import { FC } from "react";
import { AlertTriangle, Building2 } from "lucide-react";
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
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) onRequestCloseAction();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <Building2 className="h-5 w-5"/>
            Delete legal entity
          </AlertDialogTitle>

          <AlertDialogDescription>
            This action cannot be undone. Legal entity{" "}
            <strong>{entity?.name ?? "Untitled legal entity"}</strong> will be
            permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600"/>
            <div>
              <h4 className="mb-1 font-medium text-red-800">Warning</h4>
              <p className="text-sm text-red-700">
                This legal entity will be permanently removed from the system.
                {asked
                  ? null
                  : entity?.assignedUsersCount
                    ? ` ${entity.assignedUsersCount} ${entity.assignedUsersCount === 1 ? "person" : "people"} currently assigned to it will lose that assignment.`
                    : " Anyone currently assigned to it will lose that assignment."}
              </p>
              {asked ? (
                <div className="mt-2 text-red-700">
                  <DetachedPeopleNotice impact={impact} isLoading={impactLoading} isError={impactError} noun="legal entity" />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading || impactLoading}
            onClick={(event) => {
              event.preventDefault();
              onConfirmAction();
            }}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Delete legal entity
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
