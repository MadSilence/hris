"use client";

import { FC, useState } from "react";
import { Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/public/desact/src/components/ui/dialog";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";
import {
  RenameAttributeGroupForm,
  RenameAttributeGroupFormValues,
} from "@/components/modules/settings/modules/attributes/components/AttributeGroup/RenameAttributeGroupForm";

type RenameAttributeGroupModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  onConfirmAction: (submission: RenameAttributeGroupFormValues) => void;
  onRequestCloseAction: () => void;
};

export const RenameAttributeGroupModal: FC<
  RenameAttributeGroupModalProps
> = ({
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
            <div className="flex items-center gap-3 text-left">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brown-100 text-brown-700">
                <Pencil className="h-5 w-5" />
              </span>
              <div className="space-y-1">
                <DialogTitle>Rename section</DialogTitle>
                <DialogDescription>
                  Update the section name used to organize attributes.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <RenameAttributeGroupForm
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
