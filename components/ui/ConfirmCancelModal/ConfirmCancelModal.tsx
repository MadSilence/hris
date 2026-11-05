"use client";

import { FC } from "react";
import { useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/desact/alert-dialog";

type ConfirmCancelModalProps = {
  isOpen: boolean;
  title?: string;
  description?: string;
  cancelText?: string;
  confirmText?: string;
  onCancelAction: () => void;
  onConfirmAction: () => void;
};

export const ConfirmCancelModal: FC<ConfirmCancelModalProps> = ({
  isOpen,
  title,
  description,
  cancelText,
  confirmText,
  onCancelAction,
  onConfirmAction,
}) => {
  const t = useTranslations("common");
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onCancelAction();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title ?? t("confirmCancel.title")}</AlertDialogTitle>
          <AlertDialogDescription>{description ?? t("confirmCancel.description")}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText ?? t("actions.keepEditing")}</AlertDialogCancel>

          <AlertDialogAction
            destructive
            onClick={onConfirmAction}
          >
            {confirmText ?? t("actions.discard")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
