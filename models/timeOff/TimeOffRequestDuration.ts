import { TimeOffPolicyCountingMode } from "@/api/modules/timeOff/timeOffPolicies/dto/TimeOffPolicyCountingMode";

/** Counted duration of a time-off period under a policy (working days vs calendar days). */
export type TimeOffRequestDuration = {
  amount: number;
  countingMode: TimeOffPolicyCountingMode;
  /** The picked days that are half-day holidays: each costs half a day (U5, Q13h). */
  halfDayHolidays?: string[];
};
