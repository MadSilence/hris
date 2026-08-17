"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDocumentsService } from "@/api/modules/documents/services/hrisDocumentsService";

export const renameDocumentAction = async (
  submission: RenameDocumentActionInput
): Promise<RenameDocumentActionOutput> => {
  try {
    await hrisDocumentsService.renameDocument(submission.documentId, {
      name: submission.name,
    });

    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    console.error("renameDocumentAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while renaming a document. Please try again.",
    };
  }
};

export type RenameDocumentActionInput = {
  userId: string;
  documentId: string;
  name: string;
};

export type RenameDocumentActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
