"use client";

import { FC } from "react";
import { FormError } from "@/components/feedback/FormError";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/desact/alert-dialog";
import { Alert02Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { RoleDeleteImpactDTO } from "@/api/modules/roles/dto/RoleDeleteImpactDTO";
import { messageForError } from "@/lib/errors/errorMessages";

export interface DeleteRoleModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  errorMessage?: string;
  roleName?: string;
  /** Null while the impact is still loading. */
  impact?: RoleDeleteImpactDTO | null;
  isImpactLoading?: boolean;
  /** Set when the impact could not be read at all — see the note where it is rendered. */
  impactError?: unknown;
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
  impactError,
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
          <AlertDialogTitle className="flex items-center gap-2">
            <Icon icon={Alert02Icon} />
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

        <div className="rounded-card border border-divider bg-mist p-4">
          <div className="flex items-start gap-3">
            <Icon icon={Alert02Icon} className="mt-0.5 text-secondary" />
            <div className="min-w-0 flex-1">
              <h4 className="mb-1 font-medium text-primary">What this affects</h4>

              {isImpactLoading && (
                <p className="text-body text-secondary">Checking what depends on this role…</p>
              )}

              {/*
                "We could not ask" is not the same as "there is nothing to say". When the impact
                request fails the counts are unknown, and the smoke run of 2026-08-28 found the
                dialog quietly showing the generic sentence below instead — the reader had no way
                to tell an empty role from an unreachable API before pressing Delete.
              */}
              {!isImpactLoading && !impact && !!impactError && (
                <p className="text-body text-secondary">
                  {messageForError(impactError)} Until then, how many people this affects is unknown.
                </p>
              )}

              {!isImpactLoading && !impact && !impactError && (
                <p className="text-body text-secondary">
                  Users assigned to this role may lose access to systems and workflows.
                </p>
              )}

              {!isImpactLoading && impact && (
                <ul className="space-y-1 text-body text-secondary">
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

        <p className="text-body text-tertiary">
          To take the role out of use without losing its permissions, archive it instead — it can be
          restored, though the people who held it lose it either way.
        </p>

        {errorMessage && (
          <FormError message={errorMessage} />
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>

          {/*
            Disabled only while the impact question is still open. Once we know \u2014 or know we cannot
            find out \u2014 the decision belongs to the admin. This is what "presses Delete blind" in the
            2026-08-28 run actually was: not a missing branch, but a live button in front of one.
          */}
          <AlertDialogAction
            disabled={isLoading || isImpactLoading}
            onClick={(event) => {
              // Keep the dialog mounted while the mutation runs; the caller closes it on success.
              event.preventDefault();
              void onConfirmAction();
            }}
            destructive
          >
            <Icon icon={Delete02Icon} size="sm" />
            Delete role
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
