import type { TimeOffPolicyApproverType } from "./TimeOffPolicyApproverType";

export interface TimeOffPolicyApproverDTO {
  id: string;
  approverType: TimeOffPolicyApproverType;
  approverUserId: string | null;
  approvalOrder: number;
  required: boolean;
}
