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
} from "@/public/desact/src/components/ui/alert-dialog";
import { AlertTriangle, Trash2 } from "lucide-react";

export interface DeleteRoleModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  roleName?: string;
  onConfirm: () => void;
  onRequestClose: () => void;
}

export default function DeleteRoleModal({
  isOpen,
  isLoading = false,
  roleName,
  onConfirm,
  onRequestClose,
}: DeleteRoleModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onRequestClose()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5"/>
            Delete Role
          </AlertDialogTitle>

          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete{" "}
            {roleName ? (
              <strong>“{roleName}”</strong>
            ) : (
              <strong>the selected role</strong>
            )}{" "}
            and remove all associated data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5"/>
            <div>
              <h4 className="font-medium text-red-800 mb-1">Warning</h4>
              <p className="text-sm text-red-700">
                Users assigned to this role may lose access to systems and workflows.
              </p>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} onClick={onRequestClose}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={isLoading}
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2"/>
            Delete Role
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
