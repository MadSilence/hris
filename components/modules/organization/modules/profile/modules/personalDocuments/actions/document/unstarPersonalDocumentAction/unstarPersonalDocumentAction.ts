"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDocumentsService } from "@/api/modules/documents/services/hrisDocumentsService";
import { toActionError } from "@/lib/errors/withActionError";

export const unstarPersonalDocumentAction = async (
  submission: UnstarPersonalDocumentActionInput
): Promise<UnstarPersonalDocumentActionOutput> => {
  try {
    await hrisDocumentsService.unstarDocument(submission.documentId);

    return {
      status: ActionStatus.SUCCESS,
    };
  } catch (error) {
    return toActionError(error, "unstarPersonalDocumentAction");
  }
};

export type UnstarPersonalDocumentActionInput = {
  documentId: string;
};

export type UnstarPersonalDocumentActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
