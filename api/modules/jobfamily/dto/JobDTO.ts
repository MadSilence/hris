import { JobLevelDTO } from "@/api/modules/jobfamily/dto";

export type JobDTO = {
  id: string;
  name: string;
  isSystem: boolean;
  level: JobLevelDTO;

  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};
