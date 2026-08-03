import { hrisApiBulkEditClient } from "@/api/modules/bulkEdit/clients/hrisApiBulkEditClient";
import type { BulkEditRequest, BulkEditResult } from "@/models/bulkEdit";
import type { AssignmentJobStatusDTO } from "@/api/modules/assignments/dto/SegmentAssignmentDTO";

class HrisApiBulkEditService {
  public apply(req: BulkEditRequest): Promise<BulkEditResult> {
    return hrisApiBulkEditClient.apply(req);
  }

  public jobStatus(jobId: string): Promise<AssignmentJobStatusDTO> {
    return hrisApiBulkEditClient.jobStatus(jobId);
  }
}

export const hrisApiBulkEditService = new HrisApiBulkEditService();
