"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDocumentsService } from "@/api/modules/documents/services/hrisDocumentsService";

export const deletePersonalDocumentAction = async (
  submission: DeletePersonalDocumentActionInput
): Promise<DeletePersonalDocumentActionOutput> => {
  try {
    await hrisDocumentsService.deleteDocument(submission.documentId);

    return {
      status: ActionStatus.SUCCESS,
    };
  } catch (error) {
    console.error("deletePersonalDocumentAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while deleting a document. Please try again.",
    };
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
