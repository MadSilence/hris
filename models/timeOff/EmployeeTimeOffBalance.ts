export interface EmployeeTimeOffBalance {
  id: string;
  assignmentId: string;
  policyId: string;
  userId: string;
  year: number;
  openingBalance: number;
  accruedBalance: number;
  usedBalance: number;
  adjustedBalance: number;
  carriedOverBalance: number;
  currentBalance: number;
  createdAt: string;
  updatedAt: string;
}
