import { Job } from "@/models/job/Job";

export type JobFamily = {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  archived: boolean;

  jobs: Job[];
  /** Sum over the family's jobs. */
  assignedUsersCount: number;
};
