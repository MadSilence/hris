"use client";

import { FC, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/public/desact/src/components/ui/dialog";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";
import {
  RenameJobFamilyForm,
  RenameJobFamilyFormValues,
} from "@/components/modules/settings/modules/jobcatalog/components/JobFamilyContainer/components/RenameJobFamilyForm/RenameJobFamilyForm";

type RenameJobFamilyModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  onConfirmAction: (submission: RenameJobFamilyFormValues) => void;
  onRequestCloseAction: () => void;
};

export const RenameJobFamilyModal: FC<RenameJobFamilyModalProps> = ({
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
        <DialogContent
          hideClose
          className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
        >
          <DialogHeader>
            <DialogTitle>Rename Job Family</DialogTitle>
            <DialogDescription>
              Update the job family name used to organize jobs.
            </DialogDescription>
          </DialogHeader>

          <RenameJobFamilyForm
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
