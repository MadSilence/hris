"use client";

import { showError } from "@/lib/errors/errorToast";
import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/desact/alert-dialog";
import { Alert02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

export default function RemoveAssignedUserDialog({
  trigger,
  userLabel,
  removingOwnOwnerRole = false,
  onConfirm,
}: {
  trigger: React.ReactNode;
  userLabel: string;
  /**
   * Taking the System Owner role off yourself: allowed while another owner exists (the last one is
   * refused, R00005), and then the dialog says it is you and that you will be signed out (SWEEP Q2).
   */
  removingOwnOwnerRole?: boolean;
  onConfirm: () => Promise<unknown> | void;
}) {
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const confirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      setOpen(false);
    } catch (error) {
      // Stays open: the card explains why, and the button is still there to try again.
      showError(error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Icon icon={Alert02Icon} />
            Remove user from role
          </AlertDialogTitle>

          <AlertDialogDescription>
            This will remove <strong>{userLabel}</strong> from this role.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="bg-mist border border-divider rounded-card p-4">
          <div className="flex items-start gap-3">
            <Icon icon={Alert02Icon} className="text-secondary mt-0.5" />
            <div>
              <h4 className="font-medium text-primary mb-1">Warning</h4>
              <p className="text-body text-secondary">
                {removingOwnOwnerRole
                  ? "This is you. You will lose the System Owner role and be signed out at once; another owner can give it back."
                  : "The user will lose the access granted by this role until it is assigned again."}
              </p>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            destructive
            disabled={busy}
            onClick={(event) => {
              event.preventDefault();
              void confirm();
            }}
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
