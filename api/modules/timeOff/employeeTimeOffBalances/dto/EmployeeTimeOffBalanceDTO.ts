export interface EmployeeTimeOffBalanceDTO {
  id: string;
  assignmentId: string;
  policyId: string;
  userId: string;
  periodStart: string;
  periodEnd: string | null;
  /** Projection of periodStart, kept for display. */
  year: number;
  openingBalance: number;
  accruedBalance: number;
  usedBalance: number;
  adjustedBalance: number;
  carriedOverBalance: number;
  /** What is left — the ledger. A pending request is not counted in it (U7). Counts halves (15.5). */
  currentBalance: number;
  /** What the requests nobody has answered yet reserve, apart from the balance — "Not counted yet" (U7). */
  pendingBalance: number;
  /** `currentBalance - pendingBalance`: what a new request is checked against. */
  availableBalance: number;
  /** The carried-over days still standing — what an expiry would actually take back. */
  remainingCarryover: number;
  createdAt: string;
  updatedAt: string;
}
