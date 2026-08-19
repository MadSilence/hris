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
  /** Kept in the dialog rather than the console — a failed delete is otherwise silent. */
  errorMessage?: string | null;
  onRequestCloseAction: () => void;
  onConfirmAction: () => void;
}

export const DeleteDocumentsFolderModal: FC<
  DeleteDocumentsFolderModalProps
> = ({
  isOpen,
  isLoading = false,
  folderName,
  errorMessage,
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
                The folder has to be empty. Move or delete the documents inside it first — deleting
                a folder never removes its contents.
              </p>
            </div>
          </div>
        </div>

        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            // AlertDialogAction closes the dialog on click by default, which threw away the
            // failure message before it could render — the refusal only reached the console.
            onClick={(event) => {
              event.preventDefault();
              onConfirmAction();
            }}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Delete folder
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
