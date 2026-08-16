import { TimeOffRequestUnit } from "./TimeOffRequestUnit";
import { TimeOffCertificateRequirementType } from "./TimeOffCertificateRequirementType";

export interface TimeOffPolicyRequestRulesDTO {
  policyId: string;

  minRequestUnit: TimeOffRequestUnit;

  minDurationPerRequest: number | null;
  maxDurationPerRequest: number | null;
  minGapBetweenRequests: number | null;
  allowOverlappingRequests: boolean;
  maximumRequestDaysPerYear: number | null;

  allowPastRequests: boolean;
  pastLimitDays: number | null;

  noticeRequiredEnabled: boolean;
  defaultNoticeDays: number | null;

  certificateRequirementType: TimeOffCertificateRequirementType;
  certificateRequiredFromDuration: number | null;
}
