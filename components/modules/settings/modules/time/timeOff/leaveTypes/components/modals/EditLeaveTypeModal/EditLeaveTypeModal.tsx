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
import type { LeaveType } from "@/models/timeOff";

type Props = {
  isOpen: boolean;
  isLoading?: boolean;
  leaveType: LeaveType | null;
  onConfirmAction: (values: LeaveTypeFormValues) => void;
  onCancelAction: () => void;
};

export const EditLeaveTypeModal: FC<Props> = ({
  isOpen,
  isLoading = false,
  leaveType,
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
            <DialogTitle>Edit leave type</DialogTitle>
            <DialogDescription>Update this leave type&apos;s details.</DialogDescription>
          </DialogHeader>

          {leaveType && (
            <LeaveTypeForm
              submitLabel="Save changes"
              isLoading={isLoading}
              initialValues={{
                name: leaveType.name,
                description: leaveType.description ?? "",
                category: leaveType.category ?? "",
                color: leaveType.color ?? "#b08968",
              }}
              onCancelAction={requestClose}
              onDirtyChangeAction={setIsDirty}
              onSubmitAction={onConfirmAction}
            />
          )}
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
