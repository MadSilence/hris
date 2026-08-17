"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDocumentsService } from "@/api/modules/documents/services/hrisDocumentsService";

export const moveDocumentAction = async (
  submission: MoveDocumentActionInput
): Promise<MoveDocumentActionOutput> => {
  try {
    await hrisDocumentsService.moveDocument(submission.documentId, {
      targetUserId: submission.userId,
      folderId: submission.folderId ?? null,
    });

    return {
      status: ActionStatus.SUCCESS,
    };
  } catch (error) {
    console.error("moveDocumentAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while moving a document. Please try again.",
    };
  }
};

export type MoveDocumentActionInput = {
  /** Owner of the document; the destination folder has to belong to the same person. */
  userId: string;
  documentId: string;
  folderId?: string | null;
};

export type MoveDocumentActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
