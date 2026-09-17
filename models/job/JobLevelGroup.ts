import { JobLevel } from "@/models/job/JobLevel";

export type JobLevelGroup = {
  id: string;
  name: string;
  levels: JobLevel[];

  /** Sums over the track's grades. */
  assignedJobsCount: number;
  assignedUsersCount: number;
  /** The row version the rename form sends back, so a save over someone else's change is refused. */
  version?: number;
};
