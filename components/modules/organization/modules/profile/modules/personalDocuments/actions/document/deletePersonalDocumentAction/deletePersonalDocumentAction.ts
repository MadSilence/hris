"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDocumentsService } from "@/api/modules/documents/services/hrisDocumentsService";
import { toActionError } from "@/lib/errors/withActionError";

export const deletePersonalDocumentAction = async (
  submission: DeletePersonalDocumentActionInput
): Promise<DeletePersonalDocumentActionOutput> => {
  try {
    await hrisDocumentsService.deleteDocument(submission.documentId);

    return {
      status: ActionStatus.SUCCESS,
    };
  } catch (error) {
    return toActionError(error, "deletePersonalDocumentAction");
  }
};

export type DeletePersonalDocumentActionInput = {
  userId: string;
  documentId: string;
};

export type DeletePersonalDocumentActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
