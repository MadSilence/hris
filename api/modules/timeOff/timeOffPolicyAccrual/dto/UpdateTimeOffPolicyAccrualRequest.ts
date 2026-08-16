import type { TimeOffAccrualFrequency } from "./TimeOffAccrualFrequency";

export interface UpdateTimeOffPolicyAccrualRequest {
  accrualFrequency: TimeOffAccrualFrequency;
  accrualAmount: number | null;
  accrualCap: number | null;
}
