"use client";

import { FC } from "react";
import { useTranslations } from "next-intl";
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
} from "@/components/desact/alert-dialog";

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
  const t = useTranslations("organization");
  const tCommon = useTranslations("common");

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) onRequestCloseAction();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("documents.deleteDocument.title")}</AlertDialogTitle>

          <AlertDialogDescription>
            {t.rich("documents.deleteDocument.description", {
              name: documentName ?? t("documents.deleteDocument.untitled"),
              b: (chunks) => <strong>{chunks}</strong>,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <FormError message={errorMessage} />

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{tCommon("actions.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            // AlertDialogAction closes the dialog on click by default, which threw away the
            // failure message before it could render — the refusal only reached the console.
            onClick={(event) => {
              event.preventDefault();
              onConfirmAction();
            }}
            destructive
          >
            {t("documents.deleteDocument.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
