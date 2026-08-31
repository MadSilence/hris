"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiBulkEditService } from "@/api/modules/bulkEdit/services/hrisApiBulkEditService";
import type { BulkEditRequest, BulkEditResult } from "@/models/bulkEdit";
import { toActionError } from "@/lib/errors/withActionError";

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
    return toActionError(error, "bulkEditAction");
  }
}
