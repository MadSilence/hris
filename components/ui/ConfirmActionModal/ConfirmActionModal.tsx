"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { FormError } from "@/components/feedback/FormError";
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

/**
 * The confirmation the five acts always get: Archive, Delete, Unassign, Remove, Duplicate.
 *
 * Rule: `technical_documentation/ui/ACTIONS_AND_MENUS.md` § 7. The state before it: Archive
 * confirmed on five screens and fired immediately on two — one of them **with no error handling at
 * all**, so a refused archive was completely silent — and Unassign was a hover-only ✕ on the
 * department and team tabs, unreachable on touch.
 *
 * **The dialog stays open while the action runs and while it fails.** Closing on click throws the
 * refusal away before it can be read, which is the defect `DeleteDocumentsFolderModal` carries a
 * comment about.
 */
export const ConfirmActionModal: React.FC<{
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  /** The verb on the button: "Archive", "Delete", "Unassign", "Remove", "Duplicate". */
  confirmLabel: string;
  /** Red button and a warning icon. Archive is reversible, so it is not destructive. */
  destructive?: boolean;
  isLoading?: boolean;
  errorMessage?: string | null;
  onConfirmAction: () => void | Promise<unknown>;
  onCancelAction: () => void;
}> = ({
  isOpen,
  title,
  description,
  confirmLabel,
  destructive = false,
  isLoading = false,
  errorMessage,
  onConfirmAction,
  onCancelAction,
}) => (
  <AlertDialog
    open={isOpen}
    onOpenChange={(open) => {
      if (!open && !isLoading) onCancelAction();
    }}
  >
    <AlertDialogContent className="max-w-md">
      <AlertDialogHeader>
        <AlertDialogTitle className={destructive ? "flex items-center gap-2 text-red-600" : undefined}>
          {destructive && <AlertTriangle className="h-5 w-5" />}
          {title}
        </AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>

      <FormError message={errorMessage} />

      <AlertDialogFooter>
        <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
        <AlertDialogAction
          disabled={isLoading}
          // Kept mounted while the mutation runs; the caller closes it on success.
          onClick={(event) => {
            event.preventDefault();
            void onConfirmAction();
          }}
          className={destructive ? "bg-red-600 text-white hover:bg-red-700" : undefined}
        >
          {isLoading ? `${confirmLabel}…` : confirmLabel}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
