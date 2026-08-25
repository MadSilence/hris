/** Where a day came from. Anything other than Source is frozen against provider re-fills. */
export enum PublicHolidayOrigin {
  Source = "SOURCE",
  Manual = "MANUAL",
  SourceEdited = "SOURCE_EDITED",
}
