"use client";

import { FC } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/public/desact/src/components/ui/dialog";
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
          <DialogTitle>Export assigned users</DialogTitle>
          <DialogDescription>
            Export users assigned to <strong>{roleName}</strong>.
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
