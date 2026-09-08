export interface EmployeeTimeOffBalance {
  id: string;
  assignmentId: string;
  policyId: string;
  userId: string;
  /** First day of the period this balance covers. */
  periodStart: string;
  /** Last day of the period; null when the term is unbounded. */
  periodEnd: string | null;
  /** Calendar year the period starts in — a projection of periodStart, kept for display. */
  year: number;
  openingBalance: number;
  accruedBalance: number;
  usedBalance: number;
  adjustedBalance: number;
  carriedOverBalance: number;
  currentBalance: number;
  /** Of `usedBalance`, how much is only reserved by requests nobody has answered yet. */
  pendingBalance: number;
  /** The carried-over days still standing. */
  remainingCarryover: number;
  createdAt: string;
  updatedAt: string;
}
