"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDocumentsService } from "@/api/modules/documents/services/hrisDocumentsService";
import { toActionError } from "@/lib/errors/withActionError";

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
    return toActionError(error, "documentCategoryActions");
  }
};

export const deleteDocumentCategoryAction = async (
  id: string
): Promise<DocumentCategoryActionOutput> => {
  try {
    await hrisDocumentsService.deleteCategory(id);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "documentCategoryActions");
  }
};
