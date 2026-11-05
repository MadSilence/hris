"use client";

import { useTranslations } from "next-intl";
import { FC } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/desact/dialog";
import {
  ExportRolesForm,
  ExportRolesFormValues
} from "@/components/modules/settings/modules/roles/components/RolesPageContainer/modals/ExportRolesForm";

export interface ExportRolesModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onCancelAction: () => void;
  onConfirmAction: (values: ExportRolesFormValues) => void;
}

export const ExportRolesModal: FC<ExportRolesModalProps> = ({
  isOpen,
  isLoading = false,
  onCancelAction,
  onConfirmAction,
}) => {
  const t = useTranslations("settings");
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
          <DialogTitle>{t("roles.exportRoles.title")}</DialogTitle>
          <DialogDescription>
            {t("roles.exportRoles.description")}
          </DialogDescription>
        </DialogHeader>

        <ExportRolesForm
          isLoading={isLoading}
          onCancelAction={requestClose}
          onSubmitAction={onConfirmAction}
        />
      </DialogContent>
    </Dialog>
  );
};
