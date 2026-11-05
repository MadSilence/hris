"use client";

import { FC, useState } from "react";
import { useTranslations } from "next-intl";
import { FormError } from "@/components/feedback/FormError";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
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
  existingNames?: string[];
  onCancelAction: () => void;
  onCreateBlankAction: (values: { name: string; description?: string }) => void | Promise<void>;
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
  existingNames = [],
  onCancelAction,
  onCreateBlankAction,
  onCreateFromTemplateAction,
}) => {
  const t = useTranslations("settings");
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
      description: (values.description ?? "").trim() || undefined,
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
            <DialogTitle>{t("roles.add.title")}</DialogTitle>
            <DialogDescription>
              {t("roles.add.description")}
            </DialogDescription>
          </DialogHeader>

          {errorMessage && (
            <FormError message={errorMessage} />
          )}

          <AddRoleForm
            isLoading={isLoading}
            templates={templates}
            existingNames={existingNames}
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
