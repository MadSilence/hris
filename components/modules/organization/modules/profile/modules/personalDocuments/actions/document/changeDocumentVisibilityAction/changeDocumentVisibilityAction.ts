"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDocumentsService } from "@/api/modules/documents/services/hrisDocumentsService";
import type { DocumentVisibility } from "@/api/modules/documents/dto";
import { toActionError } from "@/lib/errors/withActionError";

/** Who may read a document after it was filed — HR only, or the person too (D3). */
export async function changeDocumentVisibilityAction(
  submission: ChangeDocumentVisibilityActionInput
): Promise<ChangeDocumentVisibilityActionOutput> {
  try {
    await hrisDocumentsService.changeVisibility(submission.documentId, submission.visibility);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "changeDocumentVisibilityAction");
  }
}

export type ChangeDocumentVisibilityActionInput = {
  documentId: string;
  visibility: DocumentVisibility;
};

export type ChangeDocumentVisibilityActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
