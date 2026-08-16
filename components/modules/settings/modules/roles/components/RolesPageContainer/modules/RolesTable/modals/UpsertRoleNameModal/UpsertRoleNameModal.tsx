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
  errorMessage?: string;
  mode: Mode;
  initialName: string;
  initialDescription?: string;
  takenNames?: string[];
  onCancelAction: () => void;
  onConfirmAction: (values: UpsertRoleNameFormValues) => void | Promise<void>;
}

const copyByMode = {
  rename: {
    title: "Edit Role",
    description:
      "Update the role name and description to keep your access model organized.",
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
  errorMessage,
  mode,
  initialName,
  initialDescription,
  takenNames = [],
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

        {errorMessage && (
          <p className="text-sm text-red-500">{errorMessage}</p>
        )}

        <UpsertRoleNameForm
          isLoading={isLoading}
          initialName={initialName}
          initialDescription={initialDescription}
          // A duplicate carries the source description over untouched, so the field is only
          // offered when editing an existing role.
          showDescription={mode === "rename"}
          takenNames={takenNames}
          blockUnchanged={mode === "rename"}
          submitText={content.submitText}
          onCancelAction={requestClose}
          onSubmitAction={onConfirmAction}
        />
      </DialogContent>
    </Dialog>
  );
};
