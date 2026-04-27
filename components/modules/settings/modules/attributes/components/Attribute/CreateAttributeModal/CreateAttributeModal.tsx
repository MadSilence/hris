"use client";

import { FC, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/public/desact/src/components/ui/dialog";
import {
  CreateAttributeForm,
  CreateAttributeFormValues,
} from "@/components/modules/settings/modules/attributes/components/Attribute/CreateAttributeForm";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";

type CreateAttributeModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  onConfirmAction: (submission: CreateAttributeFormValues) => void;
  onRequestCloseAction: () => void;
};

export const CreateAttributeModal: FC<CreateAttributeModalProps> = ({
  isOpen,
  isLoading = false,
  onConfirmAction,
  onRequestCloseAction,
}) => {
  const [isDirty, setIsDirty] = useState(false);
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);

  const requestClose = () => {
    if (isLoading) return;

    if (isDirty) {
      setIsConfirmCancelOpen(true);
      return;
    }

    onRequestCloseAction();
  };

  const confirmClose = () => {
    setIsConfirmCancelOpen(false);
    onRequestCloseAction();
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) requestClose();
        }}
      >
        <DialogContent hideClose className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Attribute</DialogTitle>
            <DialogDescription>
              Create a custom attribute for your data model.
            </DialogDescription>
          </DialogHeader>

          <CreateAttributeForm
            isLoading={isLoading}
            onCancelAction={requestClose}
            onDirtyChangeAction={setIsDirty}
            onSubmitAction={onConfirmAction}
          />
        </DialogContent>
      </Dialog>

      <ConfirmCancelModal
        isOpen={isConfirmCancelOpen}
        onCancelAction={() => setIsConfirmCancelOpen(false)}
        onConfirmAction={confirmClose}
      />
    </>
  );
};
