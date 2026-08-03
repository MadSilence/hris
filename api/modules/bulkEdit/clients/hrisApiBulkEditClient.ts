import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type { BulkEditRequest, BulkEditResult } from "@/models/bulkEdit";
import type { AssignmentJobStatusDTO } from "@/api/modules/assignments/dto/SegmentAssignmentDTO";

class HrisApiBulkEditClient {
  public apply(req: BulkEditRequest): Promise<BulkEditResult> {
    return hrisApiClient.post<BulkEditResult>("/users/bulk-edit", req as unknown as Record<string, unknown>);
  }

  public jobStatus(jobId: string): Promise<AssignmentJobStatusDTO> {
    return hrisApiClient.get<AssignmentJobStatusDTO>(`/users/bulk-edit/jobs/${jobId}`);
  }
}

export const hrisApiBulkEditClient = new HrisApiBulkEditClient();
