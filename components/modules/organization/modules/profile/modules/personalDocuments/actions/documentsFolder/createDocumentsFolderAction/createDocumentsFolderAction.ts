"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import type { DocumentFolderDTO } from "@/api/modules/documents/dto";
import { hrisDocumentsService } from "@/api/modules/documents/services/hrisDocumentsService";

export const createDocumentsFolderAction = async (
  submission: CreateDocumentsFolderActionInput
): Promise<CreateDocumentsFolderActionOutput> => {
  try {
    const folder = await hrisDocumentsService.createFolder(submission.userId, {
      name: submission.name,
      parentId: submission.parentId,
    });

    return {
      status: ActionStatus.SUCCESS,
      data: folder,
    };
  } catch (error) {
    console.error("createDocumentsFolderAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while creating a folder. Please try again.",
    };
  }
};

export type CreateDocumentsFolderActionInput = {
  userId: string;
  name: string;
  parentId: string | null;
};

export type CreateDocumentsFolderActionOutput = {
  status: ActionStatus;
  data?: DocumentFolderDTO;
  errorMessage?: string;
};
