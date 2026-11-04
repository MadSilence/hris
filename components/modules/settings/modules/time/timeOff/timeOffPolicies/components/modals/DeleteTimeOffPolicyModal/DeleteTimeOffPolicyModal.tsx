"use client";

import { FC } from "react";
import { FormError } from "@/components/feedback/FormError";
import { Alert02Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
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
import type { TimeOffPolicy } from "@/models/timeOff";

type Props = {
  isOpen: boolean;
  isLoading?: boolean;
  policy: TimeOffPolicy | null;
  /**
   * Why the deletion was refused, shown inside the dialog.
   *
   * <p>Without it TIME_OFF_POLICY_IN_USE was invisible: the modal did not accept a message, so a
   * policy that could not be deleted simply did not get deleted and said nothing about why.
   */
  errorMessage?: string | null;
  onConfirmAction: () => void;
  onRequestCloseAction: () => void;
};

export const DeleteTimeOffPolicyModal: FC<Props> = ({
  isOpen,
  isLoading = false,
  errorMessage,
  policy,
  onConfirmAction,
  onRequestCloseAction,
}) => {
  if (!policy) return null;

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) onRequestCloseAction();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Icon icon={Clock01Icon} />
            Delete time off policy
          </AlertDialogTitle>

          <AlertDialogDescription>
            This action cannot be undone. Policy{" "}
            <strong>{policy.name}</strong> will be permanently deleted.
            Only draft policies with no active assignments can be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-card border border-divider bg-mist p-4">
          <div className="flex items-start gap-3">
            <Icon icon={Alert02Icon} className="mt-0.5 text-secondary" />
            <div>
              <h4 className="mb-1 font-medium text-primary">Warning</h4>
              <p className="text-body text-secondary">
                This policy will be permanently removed. This cannot be
                reversed.
              </p>
            </div>
          </div>
        </div>

        {errorMessage && (
          <FormError message={errorMessage} />
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={(event) => {
              event.preventDefault();
              onConfirmAction();
            }}
            destructive
          >
            Delete policy
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
