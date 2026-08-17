import type { TimeOffRequestStatus } from "./TimeOffRequestStatus";

/** A colleague already away over a requested range — person and days only, by design. */
export interface TimeOffOverlapDTO {
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  startDate: string;
  endDate: string;
  status: TimeOffRequestStatus;
}
