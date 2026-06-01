import type { TimeOffPolicyApproverType } from "./TimeOffPolicyApproverType";

export interface UpdateTimeOffPolicyApproverRequest {
  approverType: TimeOffPolicyApproverType;
  approverUserId: string | null;
  approvalOrder: number;
  required: boolean;
}
