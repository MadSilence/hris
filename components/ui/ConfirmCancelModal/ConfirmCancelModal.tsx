"use client";

import { FC } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/public/desact/src/components/ui/alert-dialog";

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
  title = "Discard changes?",
  description = "You have unsaved changes. Are you sure you want to close this modal?",
  cancelText = "Keep editing",
  confirmText = "Discard",
  onCancelAction,
  onConfirmAction,
}) => {
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onCancelAction();
      }}
    >
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>

          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirmAction}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
