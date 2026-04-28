"use client";

import { FC, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/public/desact/src/components/ui/dialog";
import { Role } from "@/models/role/Role";
import { UsersSearchItemDTO } from "@/models/user/fields";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";
import {
  AssignRolesForm,
  AssignRolesFormValues
} from "@/components/modules/settings/modules/roles/components/RolesPageContainer/modules/UsersRolesTable/modals/AssignRolesForm";

export interface AssignRolesModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  user: UsersSearchItemDTO | null;
  allRoles: Role[];
  onCancelAction: () => void;
  onApplyAction: (userId: string, roleIds: string[]) => void;
}

export const AssignRolesModal: FC<AssignRolesModalProps> = ({
  isOpen,
  isLoading = false,
  user,
  allRoles,
  onCancelAction,
  onApplyAction,
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

  const handleSubmit = (values: AssignRolesFormValues) => {
    if (!user) return;

    onApplyAction(user.id, values.roleIds);
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
          className="sm:max-w-xl max-h-[80vh] overflow-y-auto p-8"
          hideClose
        >
          <DialogHeader>
            <DialogTitle>Manage assigned roles</DialogTitle>
            <DialogDescription>
              Select which roles should be assigned to this user.
            </DialogDescription>
          </DialogHeader>

          <AssignRolesForm
            isLoading={isLoading}
            user={user}
            allRoles={allRoles}
            onCancelAction={requestClose}
            onDirtyChangeAction={setIsDirty}
            onSubmitAction={handleSubmit}
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
