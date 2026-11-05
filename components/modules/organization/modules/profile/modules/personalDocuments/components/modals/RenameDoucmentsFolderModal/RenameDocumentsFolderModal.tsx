"use client";

import { FC } from "react";
import { useTranslations } from "next-intl";
import { FormError } from "@/components/feedback/FormError";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/desact/dialog";
import {
  RenameDocumentsFolderForm,
  RenameDocumentsFolderFormValues
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/components/modals/RenameDocumentsFolderForm";

export interface RenameDocumentsFolderModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  folderName?: string;
  /** Kept in the dialog rather than the console — a failed rename is otherwise silent. */
  errorMessage?: string | null;
  onCancelAction: () => void;
  onConfirmAction: (values: RenameDocumentsFolderFormValues) => void;
}

export const RenameDocumentsFolderModal: FC<
  RenameDocumentsFolderModalProps
> = ({
  isOpen,
  isLoading = false,
  folderName,
  errorMessage,
  onCancelAction,
  onConfirmAction,
}) => {
  const t = useTranslations("organization");

  const requestClose = () => {
    if (isLoading) return;

    onCancelAction();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) requestClose();
      }}
    >
      <DialogContent hideClose className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("documents.renameFolder.title")}</DialogTitle>
          <DialogDescription>
            {t("documents.renameFolder.description")}
          </DialogDescription>
        </DialogHeader>

        <FormError message={errorMessage} />

        <RenameDocumentsFolderForm
          isLoading={isLoading}
          folderName={folderName}
          onCancelAction={requestClose}
          onSubmitAction={onConfirmAction}
        />
      </DialogContent>
    </Dialog>
  );
};
