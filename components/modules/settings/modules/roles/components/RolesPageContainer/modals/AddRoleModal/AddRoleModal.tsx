"use client";

import { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal";
import {
  AddRoleForm,
  AddRoleFormValues
} from "@/components/modules/settings/modules/roles/components/RolesPageContainer/modals/AddRoleForm";

type Template = {
  id: string;
  name: string;
  description?: string;
};

type AddRoleModalProps = {
  isOpen: boolean;
  isLoading?: boolean;
  errorMessage?: string;
  templates: Template[];
  onCancelAction: () => void;
  onCreateBlankAction: (values: { name: string }) => void | Promise<void>;
  onCreateFromTemplateAction: (values: {
    templateId: string;
    name?: string;
  }) => void;
};

export const AddRoleModal: FC<AddRoleModalProps> = ({
  isOpen,
  isLoading = false,
  errorMessage,
  templates,
  onCancelAction,
  onCreateBlankAction,
  onCreateFromTemplateAction,
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

  const handleConfirm = (values: AddRoleFormValues) => {
    if (values.useTemplate) {
      const name = values.templateName.trim();

      onCreateFromTemplateAction({
        templateId: values.templateId,
        name: name || undefined,
      });

      return;
    }

    onCreateBlankAction({
      name: values.name.trim(),
    });
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) requestClose();
        }}
      >
        <DialogContent hideClose className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add new role</DialogTitle>
            <DialogDescription>
              Create a new role from scratch or start from a template and adjust
              it later.
            </DialogDescription>
          </DialogHeader>

          {errorMessage && (
            <p className="text-sm text-red-500">{errorMessage}</p>
          )}

          <AddRoleForm
            isLoading={isLoading}
            templates={templates}
            onCancelAction={requestClose}
            onDirtyChangeAction={setIsDirty}
            onSubmitAction={handleConfirm}
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
