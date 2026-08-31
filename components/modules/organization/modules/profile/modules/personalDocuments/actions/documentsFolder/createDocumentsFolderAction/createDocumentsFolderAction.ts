"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import type { CreateResponse } from "@/api/models/misc";
import { hrisDocumentsService } from "@/api/modules/documents/services/hrisDocumentsService";
import { toActionError } from "@/lib/errors/withActionError";

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
    return toActionError(error, "createDocumentsFolderAction");
  }
};

export type CreateDocumentsFolderActionInput = {
  userId: string;
  name: string;
  parentId: string | null;
};

export type CreateDocumentsFolderActionOutput = {
  status: ActionStatus;
  data?: CreateResponse;
  errorMessage?: string;
};
