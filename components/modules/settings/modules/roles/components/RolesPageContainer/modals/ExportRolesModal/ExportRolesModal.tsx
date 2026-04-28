"use client";

import { FC } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/public/desact/src/components/ui/dialog";
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
          <DialogTitle>Export roles</DialogTitle>
          <DialogDescription>
            Export all roles with permissions and assigned users.
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
