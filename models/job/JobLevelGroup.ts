import { JobLevelItem } from "@/models/job/JobLevelItem";

export type JobLevelGroup = {
  id: string;
  name: string;
  levels: JobLevelItem[];
  isSystem: boolean;
}
