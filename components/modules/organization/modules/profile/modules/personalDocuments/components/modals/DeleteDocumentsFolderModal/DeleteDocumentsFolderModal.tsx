"use client";

import { FC, useEffect, useState } from "react";
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
import { FolderX } from "lucide-react";

import type {
  DocumentFolderDeleteImpactDTO,
  DocumentFolderDeleteStrategy,
} from "@/api/modules/documents/dto";

export interface DeleteDocumentsFolderModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  folderName?: string;
  /** What is inside, counted by the server when the dialog opened. */
  impact?: DocumentFolderDeleteImpactDTO | null;
  isImpactLoading?: boolean;
  /** Kept in the dialog rather than the console — a failed delete is otherwise silent. */
  errorMessage?: string | null;
  onRequestCloseAction: () => void;
  onConfirmAction: (strategy: DocumentFolderDeleteStrategy) => void;
}

const countLine = (impact: DocumentFolderDeleteImpactDTO): string | null => {
  const parts: string[] = [];
  if (impact.documents > 0) {
    parts.push(`${impact.documents} ${impact.documents === 1 ? "document" : "documents"}`);
  }
  if (impact.subfolders > 0) {
    parts.push(`${impact.subfolders} ${impact.subfolders === 1 ? "folder" : "folders"}`);
  }
  return parts.length ? parts.join(" and ") : null;
};

/**
 * Deleting a folder, with a choice about what is inside it.
 *
 * A non-empty folder used to be refused — the dialog told the reader to go and empty it by hand.
 * The deletion policy does not allow that answer: a container with contents is deleted **with a
 * strategy**, shown alongside the counts the server reports at the moment of asking. Moving the
 * contents up is the default, because unassigning into nowhere is more often data loss than intent.
 */
export const DeleteDocumentsFolderModal: FC<DeleteDocumentsFolderModalProps> = ({
  isOpen,
  isLoading = false,
  folderName,
  impact,
  isImpactLoading = false,
  errorMessage,
  onRequestCloseAction,
  onConfirmAction,
}) => {
  const [strategy, setStrategy] = useState<DocumentFolderDeleteStrategy>("MOVE_TO_PARENT");

  // Every opening starts from the safe option, whatever the last one chose.
  useEffect(() => {
    if (isOpen) setStrategy("MOVE_TO_PARENT");
  }, [isOpen]);

  const contents = impact ? countLine(impact) : null;

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
            <strong>{folderName ?? "Untitled folder"}</strong>{" "}
            {isImpactLoading
              ? "— checking what is inside…"
              : contents
                ? `holds ${contents}.`
                : "is empty."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {contents && (
          <div className="space-y-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-brown-200 p-3 hover:bg-brown-50">
              <input
                type="radio"
                name="folder-delete-strategy"
                className="mt-1"
                checked={strategy === "MOVE_TO_PARENT"}
                onChange={() => setStrategy("MOVE_TO_PARENT")}
                disabled={isLoading}
              />
              <span className="text-sm">
                <span className="font-medium">Keep the contents</span>
                <span className="block text-muted-foreground">
                  Everything inside moves one level up and stays where it can be found.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-brown-200 p-3 hover:bg-brown-50">
              <input
                type="radio"
                name="folder-delete-strategy"
                className="mt-1"
                checked={strategy === "TRASH_CONTENTS"}
                onChange={() => setStrategy("TRASH_CONTENTS")}
                disabled={isLoading}
              />
              <span className="text-sm">
                <span className="font-medium">Delete the contents too</span>
                <span className="block text-muted-foreground">
                  Documents go to the trash, where they can be restored until the retention period
                  ends.
                </span>
              </span>
            </label>
          </div>
        )}

        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading || isImpactLoading}
            // AlertDialogAction closes the dialog on click by default, which threw away the
            // failure message before it could render — the refusal only reached the console.
            onClick={(event) => {
              event.preventDefault();
              onConfirmAction(strategy);
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
