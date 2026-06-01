export interface EmployeeTimeOffBalanceAdjustment {
  id: string;
  balanceId: string;
  adjustmentAmount: number;
  reason: string;
  createdAt: string;
  createdBy: string;
}
