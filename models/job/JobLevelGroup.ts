import { JobLevel } from "@/models/job/JobLevel";

export type JobLevelGroup = {
  id: string;
  name: string;
  levels: JobLevel[];
  isSystem: boolean;

  /** Sums over the track's grades. */
  assignedJobsCount: number;
  assignedUsersCount: number;
};
