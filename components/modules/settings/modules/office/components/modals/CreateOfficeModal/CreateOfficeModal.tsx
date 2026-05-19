"use client";

import { FC, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/public/desact/src/components/ui/dialog";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";
import { CreateOfficeForm, CreateOfficeFormValues, } from "@/components/modules/settings/modules/office/components/CreateOfficeForm";

type CreateOfficeModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  initialValues?: Partial<CreateOfficeFormValues>;
  onConfirmAction: (submission: CreateOfficeFormValues) => void;
  onRequestCloseAction: () => void;
};

export const CreateOfficeModal: FC<CreateOfficeModalProps> = ({
  isOpen,
  isLoading = false,
  initialValues,
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
        <DialogContent
          hideClose
          className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
        >
          <DialogHeader>
            <DialogTitle>Create office</DialogTitle>
            <DialogDescription>
              Add office details and address information.
            </DialogDescription>
          </DialogHeader>

          <CreateOfficeForm
            isLoading={isLoading}
            initialValues={initialValues}
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
