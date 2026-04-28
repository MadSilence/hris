"use client";

import { FC } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/public/desact/src/components/ui/dialog";
import {
  UpsertRoleNameForm,
  UpsertRoleNameFormValues
} from "@/components/modules/settings/modules/roles/components/RolesPageContainer/modules/RolesTable/modals/UpsertRoleNameForm";

type Mode = "rename" | "duplicate";

export interface UpsertRoleNameModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  mode: Mode;
  initialName: string;
  onCancelAction: () => void;
  onConfirmAction: (values: UpsertRoleNameFormValues) => void;
}

const copyByMode = {
  rename: {
    title: "Rename Role",
    description:
      "Update the role name to keep your access model organized.",
    submitText: "Save changes",
  },
  duplicate: {
    title: "Duplicate Role",
    description:
      "Create a new role based on this one. You can edit permissions later.",
    submitText: "Create duplicate",
  },
};

export const UpsertRoleNameModal: FC<UpsertRoleNameModalProps> = ({
  isOpen,
  isLoading = false,
  mode,
  initialName,
  onCancelAction,
  onConfirmAction,
}) => {
  const content = copyByMode[mode];

  const requestClose = () => {
    if (isLoading) return;

    onCancelAction();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) requestClose();
      }}
    >
      <DialogContent hideClose className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>

          <DialogDescription>
            {content.description}
          </DialogDescription>
        </DialogHeader>

        <UpsertRoleNameForm
          isLoading={isLoading}
          initialName={initialName}
          submitText={content.submitText}
          onCancelAction={requestClose}
          onSubmitAction={onConfirmAction}
        />
      </DialogContent>
    </Dialog>
  );
};
