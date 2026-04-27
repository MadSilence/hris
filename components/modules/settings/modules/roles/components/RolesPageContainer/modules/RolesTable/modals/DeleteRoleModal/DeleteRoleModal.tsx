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

export interface DeleteRoleModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  roleName?: string;
  onConfirmAction: () => void;
  onRequestCloseAction: () => void;
}

export const DeleteRoleModal: FC<DeleteRoleModalProps> = ({
  isOpen,
  isLoading = false,
  roleName,
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
            <div>
              <h4 className="mb-1 font-medium text-red-800">Warning</h4>
              <p className="text-sm text-red-700">
                Users assigned to this role may lose access to systems and
                workflows.
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
            <Trash2 className="mr-2 h-4 w-4"/>
            Delete role
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
