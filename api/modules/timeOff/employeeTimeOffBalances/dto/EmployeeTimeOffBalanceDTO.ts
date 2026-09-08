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
  currentBalance: number;
  /**
   * Of `usedBalance`, how much is reserved by requests nobody has answered yet.
   *
   * The days are consumed at submission — that is what stops two requests spending the same day —
   * but the balance could not say so, and "20 left" meant the same thing whether the missing three
   * were taken or merely asked for.
   */
  pendingBalance: number;
  /** The carried-over days still standing — what an expiry would actually take back. */
  remainingCarryover: number;
  createdAt: string;
  updatedAt: string;
}
