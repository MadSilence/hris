"use client";

import { FC, useState } from "react";
import { PlayListAddIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/desact/dialog";
import {
  CreateAttributeForm,
  CreateAttributeFormValues,
} from "@/components/modules/settings/modules/attributes/components/Attribute/CreateAttributeForm";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";
import { InlineAlert } from "@/components/desact/alert";

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
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-popover bg-mist text-secondary">
                <Icon icon={PlayListAddIcon} />
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
            <InlineAlert tone="declined">
              {errorMessage}
            </InlineAlert>
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
