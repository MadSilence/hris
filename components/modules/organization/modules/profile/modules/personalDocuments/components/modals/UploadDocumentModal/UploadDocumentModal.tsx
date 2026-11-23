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
  /** Whose documents — "To Reza Karimi's documents"; null on one's own tab ("To your documents"). */
  personName?: string | null;
  /** "Hidden from Reza" / "Visible to Reza". */
  personFirstName?: string | null;
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
  personName,
  personFirstName,
}) => {
  const t = useTranslations("organization");

  // DT15: Cancel stays live while files go up — what is in stays in, the rest is not sent.
  const requestClose = () => onCancelAction();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) requestClose();
      }}
    >
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{t("documents.upload.title")}</DialogTitle>
          <DialogDescription>
            {personName ? t("documents.upload.toPerson", { name: personName }) : t("documents.upload.toOwn")}
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
          personFirstName={personFirstName}
          onCancelAction={requestClose}
          onSubmitAction={onConfirmAction}
        />
      </DialogContent>
    </Dialog>
  );
};
