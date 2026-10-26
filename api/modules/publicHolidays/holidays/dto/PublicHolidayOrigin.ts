/**
 * Where a day came from. A provider's day the company edited is still `Source`: the edit is an override
 * beside it (`PublicHolidayOverrideDTO`), not a different origin.
 */
export enum PublicHolidayOrigin {
  Source = "SOURCE",
  Manual = "MANUAL",
}
