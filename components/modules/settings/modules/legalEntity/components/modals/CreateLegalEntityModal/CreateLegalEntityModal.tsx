"use client";

import { FC, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/public/desact/src/components/ui/dialog";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";
import {
  CreateLegalEntityForm,
  CreateLegalEntityFormValues
} from "@/components/modules/settings/modules/legalEntity/components/modals/CreateLegalEntityModal/CreateLegalEntityForm";

type CreateLegalEntityModalProps = {
  isOpen: boolean;
  isLoading?: boolean;
  /** A refusal from the last attempt — rendered in the form, which stays open with it. */
  errorMessage?: string | null;
  fieldErrors?: Record<string, string> | null;
  initialValues?: Partial<CreateLegalEntityFormValues>;
  onConfirmAction: (submission: CreateLegalEntityFormValues) => void;
  onCancelAction: () => void;
};

export const CreateLegalEntityModal: FC<CreateLegalEntityModalProps> = ({
  isOpen,
  isLoading = false,
  errorMessage,
  fieldErrors,
  initialValues,
  onConfirmAction,
  onCancelAction,
}) => {
  const [isDirty, setIsDirty] = useState(false);
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);

  const requestClose = () => {
    if (isLoading) return;

    if (isDirty) {
      setIsConfirmCancelOpen(true);
      return;
    }

    onCancelAction();
  };

  const confirmClose = () => {
    setIsConfirmCancelOpen(false);
    onCancelAction();
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
          className="max-w-2xl overflow-hidden p-0"
        >
          <DialogHeader className="border-b border-brown-100 bg-brown-50/40 px-6 py-5">
            <DialogTitle>Add Legal Entity</DialogTitle>
            <DialogDescription>
              Add registration and address details for a company legal unit.
            </DialogDescription>
          </DialogHeader>

          <CreateLegalEntityForm
            isLoading={isLoading}
            errorMessage={errorMessage}
            fieldErrors={fieldErrors}
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
