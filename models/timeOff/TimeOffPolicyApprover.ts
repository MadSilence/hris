import type { TimeOffPolicyApproverType } from "@/api/modules/timeOff/timeOffPolicyApprovalSettings/dto/TimeOffPolicyApproverType";

export interface TimeOffPolicyApprover {
  id: string;
  approverType: TimeOffPolicyApproverType;
  approverUserId: string | null;
  approvalOrder: number;
  required: boolean;
}