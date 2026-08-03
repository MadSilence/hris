"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiBulkEditService } from "@/api/modules/bulkEdit/services/hrisApiBulkEditService";
import type { BulkEditRequest, BulkEditResult } from "@/models/bulkEdit";

export type BulkEditActionResult = {
  status: ActionStatus;
  data?: BulkEditResult;
  errorMessage?: string;
};

export async function bulkEditAction(req: BulkEditRequest): Promise<BulkEditActionResult> {
  try {
    const data = await hrisApiBulkEditService.apply(req);
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    console.error("bulkEditAction error:", error);
    return { status: ActionStatus.ERROR, errorMessage: "Failed to apply the change." };
  }
}
