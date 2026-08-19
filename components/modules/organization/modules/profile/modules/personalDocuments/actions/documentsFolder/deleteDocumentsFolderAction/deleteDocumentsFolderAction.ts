"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import {
  documentActionErrorMessage,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/actions/documentActionError";
import { hrisDocumentsService } from "@/api/modules/documents/services/hrisDocumentsService";

export const deleteDocumentsFolderAction = async (
  submission: DeleteDocumentsFolderActionInput
): Promise<DeleteDocumentsFolderActionOutput> => {
  try {
    await hrisDocumentsService.deleteFolder(
      submission.userId,
      submission.folderId
    );

    return {
      status: ActionStatus.SUCCESS,
    };
  } catch (error) {
    console.error("deleteDocumentsFolderAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage: documentActionErrorMessage(error, "An error occurred while deleting a folder. Please try again."),
    };
  }
};

export type DeleteDocumentsFolderActionInput = {
  userId: string;
  folderId: string;
};

export type DeleteDocumentsFolderActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
