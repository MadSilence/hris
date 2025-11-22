import { Job } from "@/models/job/Job";

export type JobFamily = {
  id: string;
  name: string;
  isSystem?: boolean;
  jobs: Job[];
};
