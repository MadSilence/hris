"use client";

import { FC } from "react";
import { useTranslations } from "next-intl";
import { FormError } from "@/components/feedback/FormError";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/desact/dialog";
import {
  MoveDocumentFolderOption,
  MoveDocumentForm,
  MoveDocumentFormValues
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/components/modals/MoveDocumentForm";

export interface MoveDocumentModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  documentName?: string;
  /** How many documents move — the title says "documents" for more than one. */
  count?: number;
  folders: MoveDocumentFolderOption[];
  currentFolderId?: string;
  /** Kept in the dialog rather than the console — a rejected move is otherwise silent. */
  errorMessage?: string | null;
  onCancelAction: () => void;
  onConfirmAction: (values: MoveDocumentFormValues) => void;
  /** T06's "New folder" in the footer. */
  onNewFolderAction?: () => void;
}

export const MoveDocumentModal: FC<MoveDocumentModalProps> = ({
  isOpen,
  isLoading = false,
  documentName,
  count = 1,
  folders,
  currentFolderId,
  errorMessage,
  onCancelAction,
  onConfirmAction,
  onNewFolderAction,
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
          {/* T06: "Move 3 files" / "Pick where they go"; one file says its own name. */}
          <DialogTitle className="truncate">
            {count === 1 && documentName
              ? t("documents.moveDocument.titleOne", { name: documentName })
              : t("documents.moveDocument.titleFiles", { count })}
          </DialogTitle>
          <DialogDescription>{t("documents.moveDocument.pick")}</DialogDescription>
        </DialogHeader>

        <FormError message={errorMessage} />

        <MoveDocumentForm
          isLoading={isLoading}
          folders={folders}
          currentFolderId={currentFolderId}
          onCancelAction={requestClose}
          onSubmitAction={onConfirmAction}
          onNewFolderAction={onNewFolderAction}
        />
      </DialogContent>
    </Dialog>
  );
};
