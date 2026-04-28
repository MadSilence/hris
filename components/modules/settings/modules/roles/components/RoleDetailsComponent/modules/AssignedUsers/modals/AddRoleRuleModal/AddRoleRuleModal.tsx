"use client";

import { FC, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/public/desact/src/components/ui/dialog";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";
import {
  AddRoleRuleForm,
  AddRoleRuleFormValues
} from "@/components/modules/settings/modules/roles/components/RoleDetailsComponent/modules/AssignedUsers/modals/AddRoleRuleForm";

type AddRoleRuleModalProps = {
  isOpen: boolean;
  isLoading?: boolean;
  onCancelAction: () => void;
  onConfirmAction: (payload: { type: AddRoleRuleFormValues["type"]; userIds: string[] }) => void;
};

export const AddRoleRuleModal: FC<AddRoleRuleModalProps> = ({
  isOpen,
  isLoading = false,
  onCancelAction,
  onConfirmAction,
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

  const handleConfirm = (values: AddRoleRuleFormValues) => {
    onConfirmAction({
      type: values.type,
      userIds: values.users.map((user) => user.id),
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
        <DialogContent hideClose className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white px-8 py-8">
          <DialogHeader>
            <DialogTitle>Add Role Rule</DialogTitle>
            <DialogDescription>
              Choose a rule type on the left. Search and select users on the right.
            </DialogDescription>
          </DialogHeader>

          <AddRoleRuleForm
            isLoading={isLoading}
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
