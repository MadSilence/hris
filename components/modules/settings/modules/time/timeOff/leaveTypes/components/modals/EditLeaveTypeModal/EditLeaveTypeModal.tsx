"use client";

import { FC, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";
import { LeaveTypeForm, type LeaveTypeFormValues } from "../LeaveTypeForm";
import type { LeaveType } from "@/models/timeOff";
import { toTagColor } from "@/lib/theme/tags";

type Props = {
  isOpen: boolean;
  isLoading?: boolean;
  leaveType: LeaveType | null;
  onConfirmAction: (values: LeaveTypeFormValues) => void;
  onCancelAction: () => void;
};

export const EditLeaveTypeModal: FC<Props> = ({
  isOpen,
  isLoading = false,
  leaveType,
  onConfirmAction,
  onCancelAction,
}) => {
  const t = useTranslations("timeOff");
  const tCommon = useTranslations("common");
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

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) requestClose();
        }}
      >
        <DialogContent hideClose className="overflow-hidden p-0">
          <DialogHeader className="border-b border-divider bg-subtle/40 px-6 py-5">
            <DialogTitle>{t("leaveTypes.edit.title")}</DialogTitle>
            <DialogDescription>{t("leaveTypes.edit.description")}</DialogDescription>
          </DialogHeader>

          {leaveType && (
            <LeaveTypeForm
              submitLabel={tCommon("actions.saveChanges")}
              isLoading={isLoading}
              initialValues={{
                name: leaveType.name,
                description: leaveType.description ?? "",
                category: leaveType.category ?? "",
                color: toTagColor(leaveType.color),
              }}
              onCancelAction={requestClose}
              onDirtyChangeAction={setIsDirty}
              onSubmitAction={onConfirmAction}
            />
          )}
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
