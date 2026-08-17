"use client";

import { FC } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/public/desact/src/components/ui/dialog";
import type { DocumentVisibility } from "@/api/modules/documents/dto";
import {
  CategoryOption,
  FolderOption,
  UploadDocumentForm,
  UploadDocumentFormValues,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/components/modals/UploadDocumentForm";

export interface UploadDocumentModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  folders: FolderOption[];
  categories?: CategoryOption[];
  defaultFolderId?: string;
  defaultVisibility?: DocumentVisibility;
  /** Kept in the dialog rather than the console — a failed upload is otherwise silent. */
  errorMessage?: string | null;
  onCancelAction: () => void;
  onConfirmAction: (values: UploadDocumentFormValues) => void;
}

export const UploadDocumentModal: FC<UploadDocumentModalProps> = ({
  isOpen,
  isLoading = false,
  folders,
  categories,
  defaultFolderId,
  defaultVisibility,
  errorMessage,
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
      <DialogContent hideClose className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add document</DialogTitle>
          <DialogDescription>
            Upload a document and place it into a folder.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

        <UploadDocumentForm
          isLoading={isLoading}
          folders={folders}
          categories={categories}
          defaultFolderId={defaultFolderId}
          defaultVisibility={defaultVisibility}
          onCancelAction={requestClose}
          onSubmitAction={onConfirmAction}
        />
      </DialogContent>
    </Dialog>
  );
};
