/**
 * When a period's accrual lands.
 *
 * `EndOfPeriod` counts completed periods, so a monthly policy holds nothing until the end of
 * January; `StartOfPeriod` credits the period as it opens, which is what a company usually means by
 * "a day a month".
 */
export enum TimeOffAccrualTiming {
  StartOfPeriod = "START_OF_PERIOD",
  EndOfPeriod = "END_OF_PERIOD",
}
