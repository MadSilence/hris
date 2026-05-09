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
import { AlertTriangle, UserRoundX } from "lucide-react";

export interface DeleteUserAvatarModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  fullName?: string;
  onRequestCloseAction: () => void;
  onConfirmAction: () => void;
}

export const DeleteUserAvatarModal: FC<DeleteUserAvatarModalProps> = ({
  isOpen,
  isLoading = false,
  fullName,
  onRequestCloseAction,
  onConfirmAction,
}) => {
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
            <UserRoundX className="h-5 w-5"/>
            Remove avatar
          </AlertDialogTitle>

          <AlertDialogDescription>
            This action will remove the profile picture for{" "}
            <strong>{fullName ?? "this user"}</strong>. The profile will use
            initials instead.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600"/>
            <div>
              <h4 className="mb-1 font-medium text-red-800">Warning</h4>
              <p className="text-sm text-red-700">
                The current avatar will be permanently removed.
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
            Remove avatar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
