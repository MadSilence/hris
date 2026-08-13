import { TimeOffBalanceTransactionType } from "./TimeOffBalanceTransactionType";

export interface EmployeeTimeOffBalanceTransactionDTO {
  id: string;
  balanceId: string;
  type: TimeOffBalanceTransactionType;
  amount: number;
  effectiveDate: string;
  reason: string | null;
  sourceRef: string | null;
  policyVersionId: string | null;
  createdAt: string;
  createdBy: string | null;
}
