"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDocumentsService } from "@/api/modules/documents/services/hrisDocumentsService";

export type TrashActionInput = {
  userId: string;
  documentId: string;
};

export type TrashActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};

export const restoreDocumentAction = async (
  submission: TrashActionInput
): Promise<TrashActionOutput> => {
  try {
    await hrisDocumentsService.restoreDocument(submission.documentId);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    console.error("restoreDocumentAction error:", error);
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while restoring the document. Please try again.",
    };
  }
};

export const purgeDocumentAction = async (
  submission: TrashActionInput
): Promise<TrashActionOutput> => {
  try {
    await hrisDocumentsService.purgeDocument(submission.documentId);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    console.error("purgeDocumentAction error:", error);
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while deleting the document. Please try again.",
    };
  }
};
