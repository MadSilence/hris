import { JobDTO } from "@/api/modules/jobfamily/dto";

export type JobFamilyDTO = {
  id: string;
  name: string;
  isSystem: boolean;
  jobs: JobDTO[];
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};
