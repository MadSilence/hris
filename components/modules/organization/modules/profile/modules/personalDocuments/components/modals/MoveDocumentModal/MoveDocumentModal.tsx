"use client";

import { FC } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/public/desact/src/components/ui/dialog";
import {
  MoveDocumentFolderOption,
  MoveDocumentForm,
  MoveDocumentFormValues
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/components/modals/MoveDocumentForm";

export interface MoveDocumentModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  documentName?: string;
  folders: MoveDocumentFolderOption[];
  currentFolderId?: string;
  onCancelAction: () => void;
  onConfirmAction: (values: MoveDocumentFormValues) => void;
}

export const MoveDocumentModal: FC<MoveDocumentModalProps> = ({
  isOpen,
  isLoading = false,
  documentName,
  folders,
  currentFolderId,
  onCancelAction,
  onConfirmAction,
}) => {
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
          <DialogTitle>Move document</DialogTitle>
          <DialogDescription>
            Move <strong>{documentName ?? "this document"}</strong> to another
            folder.
          </DialogDescription>
        </DialogHeader>

        <MoveDocumentForm
          isLoading={isLoading}
          folders={folders}
          currentFolderId={currentFolderId}
          onCancelAction={requestClose}
          onSubmitAction={onConfirmAction}
        />
      </DialogContent>
    </Dialog>
  );
};
