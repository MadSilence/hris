"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDocumentsService } from "@/api/modules/documents/services/hrisDocumentsService";

export const starPersonalDocumentAction = async (
  submission: StarPersonalDocumentActionInput
): Promise<StarPersonalDocumentActionOutput> => {
  try {
    await hrisDocumentsService.starDocument(submission.documentId);

    return {
      status: ActionStatus.SUCCESS,
    };
  } catch (error) {
    console.error("starPersonalDocumentAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while starring a document. Please try again.",
    };
  }
};

export type StarPersonalDocumentActionInput = {
  documentId: string;
};

export type StarPersonalDocumentActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
