"use client";

import { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";
import { LeaveTypeForm, type LeaveTypeFormValues } from "../LeaveTypeForm";

type Props = {
  isOpen: boolean;
  isLoading?: boolean;
  onConfirmAction: (values: LeaveTypeFormValues) => void;
  onCancelAction: () => void;
};

export const CreateLeaveTypeModal: FC<Props> = ({
  isOpen,
  isLoading = false,
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
        <DialogContent hideClose className="max-w-2xl overflow-hidden p-0">
          <DialogHeader className="border-b border-brown-100 bg-brown-50/40 px-6 py-5">
            <DialogTitle>Create leave type</DialogTitle>
            <DialogDescription>
              Add a new category of time off. You&apos;ll define its policies next.
            </DialogDescription>
          </DialogHeader>

          <LeaveTypeForm
            submitLabel="Create type"
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
