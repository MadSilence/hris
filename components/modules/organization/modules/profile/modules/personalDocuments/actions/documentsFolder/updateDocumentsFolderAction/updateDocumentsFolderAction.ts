"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import type { DocumentFolderDTO } from "@/api/modules/documents/dto";
import { hrisDocumentsService } from "@/api/modules/documents/services/hrisDocumentsService";

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
    console.error("updateDocumentsFolderAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while renaming a folder. Please try again.",
    };
  }
};

export type UpdateDocumentsFolderActionInput = {
  userId: string;
  folderId: string;
  name: string;
};

export type UpdateDocumentsFolderActionOutput = {
  status: ActionStatus;
  data?: DocumentFolderDTO;
  errorMessage?: string;
};
