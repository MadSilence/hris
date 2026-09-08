export interface CreateEmployeeTimeOffBalanceRequest {
  assignmentId: string;
  /** First day of the period this balance covers. Replaced a bare calendar year. */
  periodStart: string;
  /** Last day of the period; null for an unbounded term. */
  periodEnd?: string | null;
  openingBalance: number;
  accruedBalance: number;
  carriedOverBalance: number;
  adjustedBalance: number;
}
