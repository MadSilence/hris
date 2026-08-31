"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDocumentsService } from "@/api/modules/documents/services/hrisDocumentsService";
import { toActionError } from "@/lib/errors/withActionError";

export const starPersonalDocumentAction = async (
  submission: StarPersonalDocumentActionInput
): Promise<StarPersonalDocumentActionOutput> => {
  try {
    await hrisDocumentsService.starDocument(submission.documentId);

    return {
      status: ActionStatus.SUCCESS,
    };
  } catch (error) {
    return toActionError(error, "starPersonalDocumentAction");
  }
};

export type StarPersonalDocumentActionInput = {
  documentId: string;
};

export type StarPersonalDocumentActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
