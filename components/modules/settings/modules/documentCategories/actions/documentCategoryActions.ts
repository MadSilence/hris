"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDocumentsService } from "@/api/modules/documents/services/hrisDocumentsService";

export type DocumentCategoryActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};

export type SaveDocumentCategoryInput = {
  id?: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
};

export const saveDocumentCategoryAction = async (
  submission: SaveDocumentCategoryInput
): Promise<DocumentCategoryActionOutput> => {
  try {
    const body = {
      name: submission.name,
      description: submission.description ?? null,
      isActive: submission.isActive ?? true,
    };

    if (submission.id) {
      await hrisDocumentsService.updateCategory(submission.id, body);
    } else {
      await hrisDocumentsService.createCategory(body);
    }

    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    console.error("saveDocumentCategoryAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while saving the category. Please try again.",
    };
  }
};

export const deleteDocumentCategoryAction = async (
  id: string
): Promise<DocumentCategoryActionOutput> => {
  try {
    await hrisDocumentsService.deleteCategory(id);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    console.error("deleteDocumentCategoryAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while deleting the category. Please try again.",
    };
  }
};
