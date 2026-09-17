import { Job } from "@/models/job/Job";

export type JobFamily = {
  id: string;
  name: string;
  description: string | null;
  archived: boolean;

  jobs: Job[];
  /** Sum over the family's jobs. */
  assignedUsersCount: number;
  /** The row version the edit form sends back, so a save over someone else's change is refused. */
  version?: number;
};
