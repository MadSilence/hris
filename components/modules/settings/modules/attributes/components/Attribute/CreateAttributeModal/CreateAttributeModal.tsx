"use client";

import { FC, useState } from "react";
import { ListPlus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/public/desact/src/components/ui/dialog";
import {
  CreateAttributeForm,
  CreateAttributeFormValues,
} from "@/components/modules/settings/modules/attributes/components/Attribute/CreateAttributeForm";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";

type CreateAttributeModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  /** Names already used in the target section, for the form's inline check. */
  existingNames?: string[];
  /** Server-side failure — shown here instead of the modal closing on its own. */
  errorMessage?: string | null;
  onConfirmAction: (submission: CreateAttributeFormValues) => void;
  onRequestCloseAction: () => void;
};

export const CreateAttributeModal: FC<CreateAttributeModalProps> = ({
  isOpen,
  isLoading = false,
  existingNames,
  errorMessage,
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
        <DialogContent hideClose className="flex h-[min(85vh,44rem)] flex-col gap-4 overflow-hidden sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 text-left">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brown-100 text-brown-700">
                <ListPlus className="h-5 w-5" />
              </span>
              <div className="space-y-1">
                <DialogTitle>Create attribute</DialogTitle>
                <DialogDescription>
                  A field people fill in on their profile.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {errorMessage && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {errorMessage}
            </p>
          )}

          <CreateAttributeForm
            isLoading={isLoading}
            existingNames={existingNames}
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
