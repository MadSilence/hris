import type { TimeOffAccrualFrequency } from "./TimeOffAccrualFrequency";

export interface TimeOffPolicyAccrualDTO {
  policyId: string;
  accrualFrequency: TimeOffAccrualFrequency;
  accrualAmount: number | null;
  accrualCap: number | null;
}
