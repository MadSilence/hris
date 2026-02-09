import { JobLevelItemDTO } from "@/api/modules/jobLevelGroup/dto/JobLevelItemDTO";

export type JobLevelGroupDTO = {
  id: string;
  name: string;
  levels: JobLevelItemDTO[];
  isSystem: boolean;

  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}
