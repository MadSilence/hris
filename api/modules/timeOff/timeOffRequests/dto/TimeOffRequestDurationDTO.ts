import { TimeOffPolicyCountingMode } from "@/api/modules/timeOff/timeOffPolicies/dto/TimeOffPolicyCountingMode";

export type TimeOffRequestDurationDTO = {
  amount: number;
  countingMode: TimeOffPolicyCountingMode;
  /** The picked days that are half-day holidays: each costs half a day (U5, Q13h). */
  halfDayHolidays?: string[];
};
