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

export interface PurgeDocumentModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  documentName?: string;
  errorMessage?: string | null;
  onRequestCloseAction: () => void;
  onConfirmAction: () => void;
}

/**
 * Confirmation for **Delete forever** — the one action in the documents module that cannot be
 * undone.
 *
 * It had none: the irreversible purge fired on a single click while the *reversible* delete beside
 * it opened a full dialog. The confirmations were on backwards, which is the shape of mistake that
 * only shows up once, on someone else's file.
 */
export const PurgeDocumentModal: FC<PurgeDocumentModalProps> = ({
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
            <Trash2 className="h-5 w-5"/>
            Delete forever
          </AlertDialogTitle>

          <AlertDialogDescription>
            <strong>{documentName ?? "Untitled document"}</strong> and the stored file will be
            erased. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600"/>
            <div>
              <h4 className="mb-1 font-medium text-red-800">There is no trash after this</h4>
              <p className="text-sm text-red-700">
                Leaving the document where it is deletes it automatically once the retention period
                ends.
              </p>
            </div>
          </div>
        </div>

        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            // AlertDialogAction closes its dialog on click by default, which throws the failure
            // away before it can render.
            onClick={(event) => {
              event.preventDefault();
              onConfirmAction();
            }}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Delete forever
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
