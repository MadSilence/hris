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
import type { TimeOffPolicy } from "@/models/timeOff";
import {
  EditTimeOffPolicyForm,
  type EditTimeOffPolicyFormValues,
} from "./EditTimeOffPolicyForm";

type Props = {
  isOpen: boolean;
  isLoading?: boolean;
  policy: TimeOffPolicy | null;
  onConfirmAction: (values: EditTimeOffPolicyFormValues) => void;
  onCancelAction: () => void;
};

export const EditTimeOffPolicyModal: FC<Props> = ({
  isOpen,
  isLoading = false,
  policy,
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

  if (!policy) return null;

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) requestClose();
        }}
      >
        <DialogContent hideClose className="max-w-lg overflow-hidden p-0">
          <DialogHeader className="border-b border-brown-100 bg-brown-50/40 px-6 py-5">
            <DialogTitle>Edit time off policy</DialogTitle>
            <DialogDescription>
              Update the configuration for{" "}
              <strong>{policy.displayName}</strong>.
            </DialogDescription>
          </DialogHeader>

          <EditTimeOffPolicyForm
            policy={policy}
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
