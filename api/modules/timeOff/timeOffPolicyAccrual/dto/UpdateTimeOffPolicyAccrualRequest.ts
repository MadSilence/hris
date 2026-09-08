import type { TimeOffAccrualFrequency } from "./TimeOffAccrualFrequency";
import type { TimeOffAccrualTiming } from "./TimeOffAccrualTiming";

export interface UpdateTimeOffPolicyAccrualRequest {
  accrualFrequency: TimeOffAccrualFrequency;
  accrualAmount: number | null;
  accrualCap: number | null;
  /** Whether a period's days land when it opens or when it closes. */
  accrualTiming: TimeOffAccrualTiming;
  /** Whether days accumulate while the person is still inside their waiting period. */
  accrueDuringWaitingPeriod: boolean;
}
