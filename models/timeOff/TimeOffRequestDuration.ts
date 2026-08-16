import { TimeOffPolicyCountingMode } from "@/api/modules/timeOff/timeOffPolicies/dto/TimeOffPolicyCountingMode";

/** Counted duration of a time-off period under a policy (working days vs calendar days). */
export type TimeOffRequestDuration = {
  amount: number;
  countingMode: TimeOffPolicyCountingMode;
};
