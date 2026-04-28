"use client";

import { FC } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/public/desact/src/components/ui/dialog";
import {
  FolderOption,
  UploadDocumentForm,
  UploadDocumentFormValues
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/components/modals/UploadDocumentForm";

export interface UploadDocumentModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  folders: FolderOption[];
  defaultFolderId?: string;
  onCancelAction: () => void;
  onConfirmAction: (values: UploadDocumentFormValues) => void;
}

export const UploadDocumentModal: FC<UploadDocumentModalProps> = ({
  isOpen,
  isLoading = false,
  folders,
  defaultFolderId,
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
      <DialogContent hideClose className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add document</DialogTitle>
          <DialogDescription>
            Upload a document and place it into a folder.
          </DialogDescription>
        </DialogHeader>

        <UploadDocumentForm
          isLoading={isLoading}
          folders={folders}
          defaultFolderId={defaultFolderId}
          onCancelAction={requestClose}
          onSubmitAction={onConfirmAction}
        />
      </DialogContent>
    </Dialog>
  );
};
