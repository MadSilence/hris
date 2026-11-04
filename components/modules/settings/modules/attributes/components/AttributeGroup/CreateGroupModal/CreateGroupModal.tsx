"use client";

import { FC, useState } from "react";
import { Layers01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/desact/dialog";
import {
  CreateGroupForm,
  CreateGroupFormValues,
} from "@/components/modules/settings/modules/attributes/components/AttributeGroup/CreateGroupForm";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";
import { InlineAlert } from "@/components/desact/alert";

type CreateGroupModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  /** Names already taken, for the form's inline check. */
  existingNames?: string[];
  /** Server-side failure — the modal stays open and shows it instead of closing silently. */
  errorMessage?: string | null;
  onConfirmAction: (submission: CreateGroupFormValues) => void;
  onRequestCloseAction: () => void;
};

export const CreateGroupModal: FC<CreateGroupModalProps> = ({
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
        <DialogContent
          hideClose
          className="gap-5 sm:max-w-xl"
        >
          <DialogHeader>
            <div className="flex items-center gap-3 text-left">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-popover bg-mist text-secondary">
                <Icon icon={Layers01Icon} />
              </span>
              <div className="space-y-1">
                <DialogTitle>Create section</DialogTitle>
                <DialogDescription>
                  Group related attributes into a section on the profile.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {errorMessage && (
            <InlineAlert tone="declined">
              {errorMessage}
            </InlineAlert>
          )}

          <CreateGroupForm
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
