"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDocumentsService } from "@/api/modules/documents/services/hrisDocumentsService";
import { toActionError } from "@/lib/errors/withActionError";

export const renameDocumentAction = async (
  submission: RenameDocumentActionInput
): Promise<RenameDocumentActionOutput> => {
  try {
    await hrisDocumentsService.renameDocument(submission.documentId, {
      name: submission.name,
    });

    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "renameDocumentAction");
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
