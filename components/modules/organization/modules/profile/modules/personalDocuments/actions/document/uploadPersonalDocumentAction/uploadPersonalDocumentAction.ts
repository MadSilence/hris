"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import type { DocumentDTO } from "@/api/modules/documents/dto";
import { hrisDocumentsService } from "@/api/modules/documents/services/hrisDocumentsService";

export const uploadPersonalDocumentAction = async (
  submission: UploadPersonalDocumentActionInput
): Promise<UploadPersonalDocumentActionOutput> => {
  try {
    const document = await hrisDocumentsService.uploadDocument(submission.userId, {
      file: submission.file,
      folderId: submission.folderId ?? null,
      categoryId: submission.categoryId ?? null,
    });

    return {
      status: ActionStatus.SUCCESS,
      data: document,
    };
  } catch (error) {
    console.error("uploadPersonalDocumentAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while uploading a document. Please try again.",
    };
  }
};

export type UploadPersonalDocumentActionInput = {
  userId: string;
  file: File;
  folderId?: string | null;
  categoryId?: string | null;
};

export type UploadPersonalDocumentActionOutput = {
  status: ActionStatus;
  data?: DocumentDTO;
  errorMessage?: string;
};
