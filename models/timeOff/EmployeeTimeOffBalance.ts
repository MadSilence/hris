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
  /** What is left — the ledger. A pending request is not counted in it (U7); counts halves ("15.5"). */
  currentBalance: number;
  /** What the requests nobody has answered yet reserve, apart from the balance — "Not counted yet" (U7). */
  pendingBalance: number;
  /** `currentBalance - pendingBalance`: what a new request is checked against, and what is left after it. */
  availableBalance: number;
  /** The carried-over days still standing. */
  remainingCarryover: number;
  createdAt: string;
  updatedAt: string;
}
