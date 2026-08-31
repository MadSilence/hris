"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDocumentsService } from "@/api/modules/documents/services/hrisDocumentsService";
import { toActionError } from "@/lib/errors/withActionError";
import type { DocumentFolderDeleteStrategy } from "@/api/modules/documents/dto";

export const deleteDocumentsFolderAction = async (
  submission: DeleteDocumentsFolderActionInput
): Promise<DeleteDocumentsFolderActionOutput> => {
  try {
    await hrisDocumentsService.deleteFolder(
      submission.userId,
      submission.folderId,
      submission.strategy ?? "MOVE_TO_PARENT"
    );

    return {
      status: ActionStatus.SUCCESS,
    };
  } catch (error) {
    return toActionError(error, "deleteDocumentsFolderAction");
  }
};

export type DeleteDocumentsFolderActionInput = {
  userId: string;
  folderId: string;
  /** What happens to the contents. Absent means the outcome that loses nothing. */
  strategy?: DocumentFolderDeleteStrategy;
};

export type DeleteDocumentsFolderActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
