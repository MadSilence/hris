import { JobLevel } from "@/models/job/JobLevel";

export type Job = {
  id: string;
  name: string;
  isSystem?: boolean;
  level: JobLevel;
};
