"use client";

import { useTranslations } from "next-intl";
import { FC } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/desact/dialog";
import {
  ExportAssignedUsersForm,
  ExportAssignedUsersFormValues
} from "@/components/modules/settings/modules/roles/components/RoleDetailsContainer/modules/AssignedUsers/modals/ExportAssignedUsersForm";

export interface ExportAssignedUsersModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  roleName: string;
  onCancelAction: () => void;
  onConfirmAction: (values: ExportAssignedUsersFormValues) => void;
}

export const ExportAssignedUsersModal: FC<ExportAssignedUsersModalProps> = ({
  isOpen,
  isLoading = false,
  roleName,
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
          <DialogTitle>{t("roles.exportAssigned.title")}</DialogTitle>
          <DialogDescription>
            {t.rich("roles.exportAssigned.description", { role: roleName, b: (c) => <strong>{c}</strong> })}
          </DialogDescription>
        </DialogHeader>

        <ExportAssignedUsersForm
          isLoading={isLoading}
          onCancelAction={requestClose}
          onSubmitAction={onConfirmAction}
        />
      </DialogContent>
    </Dialog>
  );
};
