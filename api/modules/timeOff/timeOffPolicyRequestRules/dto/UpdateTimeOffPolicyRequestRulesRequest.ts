import { TimeOffRequestUnit } from "./TimeOffRequestUnit";
import { TimeOffCertificateRequirementType } from "./TimeOffCertificateRequirementType";

export interface UpdateTimeOffPolicyRequestRulesRequest {
  minRequestUnit: TimeOffRequestUnit;
  maxRequestUnit: TimeOffRequestUnit | null;

  allowHalfDay: boolean;
  allowHourlyRequests: boolean;

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
