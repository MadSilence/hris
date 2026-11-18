"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import type { DocumentFolderDTO } from "@/api/modules/documents/dto";
import { hrisDocumentsService } from "@/api/modules/documents/services/hrisDocumentsService";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

/** A folder's icon and colour (documents-tab T03, "Icon and color"). */
export async function updateFolderLookAction(input: {
  userId: string;
  folderId: string;
  icon: string | null;
  color: string | null;
}): Promise<ActionResult<DocumentFolderDTO>> {
  try {
    const data = await hrisDocumentsService.updateFolderLook(input.userId, input.folderId, { icon: input.icon, color: input.color });
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    return toActionError(error, "updateFolderLookAction");
  }
}
