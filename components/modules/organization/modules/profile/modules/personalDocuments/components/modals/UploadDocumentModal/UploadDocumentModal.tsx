"use client";

import { FC } from "react";
import { useTranslations } from "next-intl";
import { FormError } from "@/components/feedback/FormError";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/desact/dialog";
import type { DocumentVisibility } from "@/api/modules/documents/dto";
import {
  CategoryOption,
  FolderOption,
  UploadDocumentForm,
  UploadDocumentFormValues,
  type UploadFileStatus,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/components/modals/UploadDocumentForm";

export interface UploadDocumentModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  folders: FolderOption[];
  categories?: CategoryOption[];
  defaultFolderId?: string;
  defaultVisibility?: DocumentVisibility;
  /** Files dropped before it opened (T07). */
  initialFiles?: File[];
  /** Each file's progress while it uploads (M3). */
  statuses?: Record<string, UploadFileStatus>;
  /** Kept in the dialog rather than the console — a failed upload is otherwise silent. */
  errorMessage?: string | null;
  onCancelAction: () => void;
  onConfirmAction: (values: UploadDocumentFormValues) => void;
}

export const UploadDocumentModal: FC<UploadDocumentModalProps> = ({
  isOpen,
  isLoading = false,
  folders,
  categories,
  defaultFolderId,
  defaultVisibility,
  initialFiles,
  statuses,
  errorMessage,
  onCancelAction,
  onConfirmAction,
}) => {
  const t = useTranslations("organization");

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
      <DialogContent hideClose className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{t("documents.upload.title")}</DialogTitle>
          <DialogDescription>
            {t("documents.upload.description")}
          </DialogDescription>
        </DialogHeader>

        <FormError message={errorMessage} />

        <UploadDocumentForm
          isLoading={isLoading}
          folders={folders}
          categories={categories}
          defaultFolderId={defaultFolderId}
          defaultVisibility={defaultVisibility}
          initialFiles={initialFiles}
          statuses={statuses}
          onCancelAction={requestClose}
          onSubmitAction={onConfirmAction}
        />
      </DialogContent>
    </Dialog>
  );
};
