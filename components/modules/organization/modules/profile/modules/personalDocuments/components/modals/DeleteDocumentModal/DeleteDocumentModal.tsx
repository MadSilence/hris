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
import { FileX2 } from "lucide-react";

export interface DeleteDocumentModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  documentName?: string;
  /** Kept in the dialog rather than the console — a failed delete is otherwise silent. */
  errorMessage?: string | null;
  onRequestCloseAction: () => void;
  onConfirmAction: () => void;
}

export const DeleteDocumentModal: FC<DeleteDocumentModalProps> = ({
  isOpen,
  isLoading = false,
  documentName,
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
            <FileX2 className="h-5 w-5"/>
            Delete document
          </AlertDialogTitle>

          <AlertDialogDescription>
            <strong>{documentName ?? "Untitled document"}</strong> will be moved to the trash, where
            it can be restored until the retention period ends.
          </AlertDialogDescription>
        </AlertDialogHeader>

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
            Delete document
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
