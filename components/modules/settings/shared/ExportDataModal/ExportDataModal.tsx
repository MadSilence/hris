"use client";

import { FC } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/public/desact/src/components/ui/dialog";
import {
  ExportDataForm,
  ExportDataFormValues,
} from "@/components/modules/settings/shared/ExportDataModal/ExportDataForm";

export interface ExportDataModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  title: string;
  description: string;
  includedText: string;
  /** Kept in the dialog rather than the console — a failed download is otherwise silent. */
  errorMessage?: string | null;
  onCancelAction: () => void;
  onConfirmAction: (values: ExportDataFormValues) => void;
}

export const ExportDataModal: FC<ExportDataModalProps> = ({
  isOpen,
  isLoading = false,
  title,
  description,
  includedText,
  errorMessage,
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
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

        <ExportDataForm
          isLoading={isLoading}
          includedText={includedText}
          onCancelAction={requestClose}
          onSubmitAction={onConfirmAction}
        />
      </DialogContent>
    </Dialog>
  );
};
