"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDocumentsService } from "@/api/modules/documents/services/hrisDocumentsService";

export const unstarPersonalDocumentAction = async (
  submission: UnstarPersonalDocumentActionInput
): Promise<UnstarPersonalDocumentActionOutput> => {
  try {
    await hrisDocumentsService.unstarDocument(submission.documentId);

    return {
      status: ActionStatus.SUCCESS,
    };
  } catch (error) {
    console.error("unstarPersonalDocumentAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while unstarring a document. Please try again.",
    };
  }
};

export type UnstarPersonalDocumentActionInput = {
  documentId: string;
};

export type UnstarPersonalDocumentActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
