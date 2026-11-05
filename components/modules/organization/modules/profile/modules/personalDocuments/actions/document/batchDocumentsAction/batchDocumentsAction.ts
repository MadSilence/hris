"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDocumentsService } from "@/api/modules/documents/services/hrisDocumentsService";
import type { DocumentBatchOperation } from "@/api/modules/documents/clients/hrisApiDocumentsClient";
import { toActionError } from "@/lib/errors/withActionError";

/** Several documents at once (D2) — delete, restore, erase, star or move. All or none, on the server. */
export async function batchDocumentsAction(
  submission: BatchDocumentsActionInput
): Promise<BatchDocumentsActionOutput> {
  try {
    await hrisDocumentsService.batch(submission.operation, {
      ids: submission.ids,
      folderId: submission.folderId ?? null,
      targetUserId: submission.targetUserId,
      starred: submission.starred,
    });
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "batchDocumentsAction");
  }
}

export type BatchDocumentsActionInput = {
  operation: DocumentBatchOperation;
  ids: string[];
  folderId?: string | null;
  targetUserId?: string;
  starred?: boolean;
};

export type BatchDocumentsActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
