/** What a balance will hold on a date, given everything already known about it. */
export interface BalanceAsOfDTO {
  balanceId: string;
  asOf: string;
  balance: number;
}
