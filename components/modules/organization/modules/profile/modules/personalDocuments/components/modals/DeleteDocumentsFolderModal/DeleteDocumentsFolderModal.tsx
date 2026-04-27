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
import { AlertTriangle, FolderX } from "lucide-react";

export interface DeleteDocumentsFolderModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  folderName?: string;
  documentsCount?: number;
  onRequestCloseAction: () => void;
  onConfirmAction: () => void;
}

export const DeleteDocumentsFolderModal: FC<
  DeleteDocumentsFolderModalProps
> = ({
  isOpen,
  isLoading = false,
  folderName,
  documentsCount = 0,
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
            <FolderX className="h-5 w-5"/>
            Delete folder
          </AlertDialogTitle>

          <AlertDialogDescription>
            This action cannot be undone. Folder{" "}
            <strong>{folderName ?? "Untitled folder"}</strong> will be
            permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600"/>
            <div>
              <h4 className="mb-1 font-medium text-red-800">Warning</h4>
              <p className="text-sm text-red-700">
                {documentsCount > 0
                  ? `All ${documentsCount} document(s) inside this folder may also be affected. Make sure they are moved before deletion.`
                  : "This folder will be removed from the user documents list."}
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
            Delete folder
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
