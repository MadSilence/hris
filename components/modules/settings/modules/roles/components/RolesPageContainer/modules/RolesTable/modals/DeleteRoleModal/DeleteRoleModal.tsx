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
import { AlertTriangle, Trash2 } from "lucide-react";
import { RoleDeleteImpactDTO } from "@/api/modules/roles/dto/RoleDeleteImpactDTO";

export interface DeleteRoleModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  errorMessage?: string;
  roleName?: string;
  /** Null while the impact is still loading. */
  impact?: RoleDeleteImpactDTO | null;
  isImpactLoading?: boolean;
  onConfirmAction: () => void | Promise<void>;
  onRequestCloseAction: () => void;
}

export const DeleteRoleModal: FC<DeleteRoleModalProps> = ({
  isOpen,
  isLoading = false,
  errorMessage,
  roleName,
  impact,
  isImpactLoading = false,
  onConfirmAction,
  onRequestCloseAction,
}) => {
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) onRequestCloseAction();
      }}
    >
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5"/>
            Delete role
          </AlertDialogTitle>

          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete{" "}
            {roleName ? (
              <strong>{roleName}</strong>
            ) : (
              <strong>the selected role</strong>
            )}{" "}
            and remove all associated data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600"/>
            <div className="min-w-0 flex-1">
              <h4 className="mb-1 font-medium text-red-800">What this affects</h4>

              {isImpactLoading && (
                <p className="text-sm text-red-700">Checking what depends on this role…</p>
              )}

              {!isImpactLoading && !impact && (
                <p className="text-sm text-red-700">
                  Users assigned to this role may lose access to systems and workflows.
                </p>
              )}

              {!isImpactLoading && impact && (
                <ul className="space-y-1 text-sm text-red-700">
                  <li>
                    <strong>{impact.peopleCount}</strong>{" "}
                    {impact.peopleCount === 1 ? "person holds" : "people hold"} this role.
                  </li>
                  {/* The number that actually matters: these people cannot work tomorrow. */}
                  <li>
                    <strong>{impact.peopleLosingLastRole}</strong> of them would be left with the
                    default role only.
                  </li>
                  {/* History, not pending work: these applications already happened. */}
                  {impact.bulkAssignmentCount > 0 && (
                    <li>
                      It was handed out by <strong>{impact.bulkAssignmentCount}</strong> bulk{" "}
                      {impact.bulkAssignmentCount === 1 ? "assignment" : "assignments"}, which will
                      be left pointing at a deleted role.
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          To take the role out of use without losing it, archive it instead — assignments are kept
          and it can be restored.
        </p>

        {errorMessage && (
          <p className="text-sm text-red-500">{errorMessage}</p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            disabled={isLoading}
            onClick={(event) => {
              // Keep the dialog mounted while the mutation runs; the caller closes it on success.
              event.preventDefault();
              void onConfirmAction();
            }}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4"/>
            Delete role
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
