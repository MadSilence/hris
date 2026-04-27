"use client";

import { FC, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/public/desact/src/components/ui/dialog";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";
import {
  CreateJobFamilyForm,
  CreateJobFamilyFormValues,
} from "@/components/modules/settings/modules/jobcatalog/components/JobFamilyContainer/components/CreateJobFamilyForm";

type CreateJobFamilyModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  onConfirmAction: (submission: CreateJobFamilyFormValues) => void;
  onRequestCloseAction: () => void;
};

export const CreateJobFamilyModal: FC<CreateJobFamilyModalProps> = ({
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
            <DialogTitle>Create Job Family</DialogTitle>
            <DialogDescription>
              Create a new job family to organize jobs.
            </DialogDescription>
          </DialogHeader>

          <CreateJobFamilyForm
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
