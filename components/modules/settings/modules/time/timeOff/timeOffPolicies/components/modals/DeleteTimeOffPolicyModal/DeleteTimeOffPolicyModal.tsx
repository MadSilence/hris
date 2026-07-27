"use client";

import { FC } from "react";
import { AlertTriangle, Clock } from "lucide-react";
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
import type { TimeOffPolicy } from "@/models/timeOff";

type Props = {
  isOpen: boolean;
  isLoading?: boolean;
  policy: TimeOffPolicy | null;
  onConfirmAction: () => void;
  onRequestCloseAction: () => void;
};

export const DeleteTimeOffPolicyModal: FC<Props> = ({
  isOpen,
  isLoading = false,
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
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <Clock className="h-5 w-5" />
            Delete time off policy
          </AlertDialogTitle>

          <AlertDialogDescription>
            This action cannot be undone. Policy{" "}
            <strong>{policy.displayName}</strong> will be permanently deleted.
            Only draft policies with no active assignments can be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
            <div>
              <h4 className="mb-1 font-medium text-red-800">Warning</h4>
              <p className="text-sm text-red-700">
                This policy will be permanently removed. This cannot be
                reversed.
              </p>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={onConfirmAction}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Delete policy
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
