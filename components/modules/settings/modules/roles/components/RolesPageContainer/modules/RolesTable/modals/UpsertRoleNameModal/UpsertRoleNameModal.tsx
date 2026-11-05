"use client";

import { FC } from "react";
import { useTranslations } from "next-intl";
import { FormError } from "@/components/feedback/FormError";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/desact/dialog";
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

const copyByMode = (t: ReturnType<typeof useTranslations<"settings">>, tCommon: ReturnType<typeof useTranslations<"common">>) => ({
  rename: {
    title: t("roles.upsert.renameTitle"),
    description: t("roles.upsert.renameDescription"),
    submitText: tCommon("actions.saveChanges"),
  },
  duplicate: {
    title: t("roles.upsert.duplicateTitle"),
    description: t("roles.upsert.duplicateDescription"),
    submitText: t("roles.upsert.duplicateSubmit"),
  },
});

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
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const content = copyByMode(t, tCommon)[mode];

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
          <FormError message={errorMessage} />
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
