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
  /** Edit only: the version the dialog was opened with; a stale one comes back as E00409. */
  version?: number;
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
      // Only the update carries the version: the create body is strict and has no such field.
      await hrisDocumentsService.updateCategory(submission.id, { ...body, version: submission.version });
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
