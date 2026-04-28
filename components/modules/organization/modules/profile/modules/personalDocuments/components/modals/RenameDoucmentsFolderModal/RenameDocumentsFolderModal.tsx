"use client";

import { FC } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/public/desact/src/components/ui/dialog";
import {
  RenameDocumentsFolderForm,
  RenameDocumentsFolderFormValues
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/components/modals/RenameDocumentsFolderForm";

export interface RenameDocumentsFolderModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  folderName?: string;
  onCancelAction: () => void;
  onConfirmAction: (values: RenameDocumentsFolderFormValues) => void;
}

export const RenameDocumentsFolderModal: FC<
  RenameDocumentsFolderModalProps
> = ({
  isOpen,
  isLoading = false,
  folderName,
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
          <DialogTitle>Rename folder</DialogTitle>
          <DialogDescription>
            Update the folder name. All documents inside will stay in place.
          </DialogDescription>
        </DialogHeader>

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
