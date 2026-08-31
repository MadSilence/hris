"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import type { UpdateResponse } from "@/api/models/misc";
import { hrisDocumentsService } from "@/api/modules/documents/services/hrisDocumentsService";
import { toActionError } from "@/lib/errors/withActionError";

export const updateDocumentsFolderAction = async (
  submission: UpdateDocumentsFolderActionInput
): Promise<UpdateDocumentsFolderActionOutput> => {
  try {
    const folder = await hrisDocumentsService.renameFolder(
      submission.userId,
      submission.folderId,
      {
        name: submission.name,
      }
    );

    return {
      status: ActionStatus.SUCCESS,
      data: folder,
    };
  } catch (error) {
    return toActionError(error, "updateDocumentsFolderAction");
  }
};

export type UpdateDocumentsFolderActionInput = {
  userId: string;
  folderId: string;
  name: string;
};

export type UpdateDocumentsFolderActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
