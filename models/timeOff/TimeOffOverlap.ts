import type { TimeOffRequestStatus } from "./TimeOffRequestStatus";

/** A colleague already away over a requested range — person and days only, by design. */
export interface TimeOffOverlap {
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  startDate: string;
  endDate: string;
  status: TimeOffRequestStatus;
  /** The subject's manager — "your manager" in "Also off". */
  manager?: boolean;
  /** A team the colleague shares with the subject; null for the manager outside it. */
  teamName?: string | null;
  /** How many people the subject's teams hold besides them — the same on every row. */
  teamSize?: number;
}
