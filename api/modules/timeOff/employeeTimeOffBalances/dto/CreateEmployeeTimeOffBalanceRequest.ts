export interface CreateEmployeeTimeOffBalanceRequest {
  assignmentId: string;
  year: number;
  openingBalance: number;
  accruedBalance: number;
  carriedOverBalance: number;
  adjustedBalance: number;
}
