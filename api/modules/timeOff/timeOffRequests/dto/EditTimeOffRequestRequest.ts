/** New dates for a request that has already been filed. */
export interface EditTimeOffRequestRequest {
  startDate: string;
  endDate: string;
  reason: string | null;
}
