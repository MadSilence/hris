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
  /** documents-expiry X07: a date is required; remind N days before (0 = no reminder); who sees an upload by default. */
  requiresExpiry?: boolean;
  remindDaysBefore?: number | null;
  defaultVisibility?: "HR_ONLY" | "VISIBLE_TO_EMPLOYEE" | "" | null;
  /** Edit only: the version the dialog was opened with; a stale one comes back as E00409. */
  version?: number;
};

export const saveDocumentCategoryAction = async (
  submission: SaveDocumentCategoryInput
): Promise<DocumentCategoryActionOutput> => {
  try {
    const body = {
      name: submission.name,
      // Sent only when the form gave them: an absent field is left as it is (DocumentCategorySettings is partial).
      ...(submission.requiresExpiry !== undefined ? { requiresExpiry: submission.requiresExpiry } : {}),
      ...(submission.remindDaysBefore !== undefined ? { remindDaysBefore: submission.remindDaysBefore ?? 0 } : {}),
      ...(submission.defaultVisibility !== undefined ? { defaultVisibility: submission.defaultVisibility ?? "" } : {}),
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

/**
 * Deletes a category (AQ-19): KEEP — its documents keep the tag and nobody picks it again; MOVE — they move to
 * `targetCategoryId` first. A category nobody uses is simply deleted.
 */
export const deleteDocumentCategoryAction = async (
  id: string,
  body: { strategy: "KEEP" | "MOVE"; targetCategoryId?: string | null } = { strategy: "KEEP" },
): Promise<DocumentCategoryActionOutput> => {
  try {
    await hrisDocumentsService.deleteCategory(id, body);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "documentCategoryActions");
  }
};
