export interface AdjustEmployeeTimeOffBalanceRequest {
  adjustmentAmount: number;
  reason: string;
  /** YYYY-MM-DD inside the balance's period, past or future (Q21b); omitted = the company's today. */
  effectiveDate?: string;
}
