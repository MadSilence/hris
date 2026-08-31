"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDocumentsService } from "@/api/modules/documents/services/hrisDocumentsService";
import { toActionError } from "@/lib/errors/withActionError";

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
    return toActionError(error, "trashActions");
  }
};

export const purgeDocumentAction = async (
  submission: TrashActionInput
): Promise<TrashActionOutput> => {
  try {
    await hrisDocumentsService.purgeDocument(submission.documentId);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "trashActions");
  }
};
