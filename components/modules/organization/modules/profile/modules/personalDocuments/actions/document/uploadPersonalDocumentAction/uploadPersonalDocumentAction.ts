"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import type { DocumentDTO, DocumentVisibility } from "@/api/modules/documents/dto";
import { hrisDocumentsService } from "@/api/modules/documents/services/hrisDocumentsService";
import { toActionError } from "@/lib/errors/withActionError";

export const uploadPersonalDocumentAction = async (
  submission: UploadPersonalDocumentActionInput
): Promise<UploadPersonalDocumentActionOutput> => {
  try {
    const document = await hrisDocumentsService.uploadDocument(submission.userId, {
      file: submission.file,
      folderId: submission.folderId ?? null,
      categoryId: submission.categoryId ?? null,
      visibility: submission.visibility ?? null,
    });

    return {
      status: ActionStatus.SUCCESS,
      data: document,
    };
  } catch (error) {
    return toActionError(error, "uploadPersonalDocumentAction");
  }
};

export type UploadPersonalDocumentActionInput = {
  userId: string;
  file: File;
  folderId?: string | null;
  categoryId?: string | null;
  visibility?: DocumentVisibility | null;
};

export type UploadPersonalDocumentActionOutput = {
  status: ActionStatus;
  data?: DocumentDTO;
  errorMessage?: string;
};
