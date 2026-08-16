import { TimeOffPolicyCountingMode } from "@/api/modules/timeOff/timeOffPolicies/dto/TimeOffPolicyCountingMode";

export type TimeOffRequestDurationDTO = {
  amount: number;
  countingMode: TimeOffPolicyCountingMode;
};
