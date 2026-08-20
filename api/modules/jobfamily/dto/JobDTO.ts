import { JobLevelDTO } from "@/api/modules/jobfamily/dto";

export type JobDTO = {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  isSystem: boolean;
  archived: boolean;

  /** Flattened by the backend so a job read on its own still knows its family. */
  familyId: string | null;
  familyName: string | null;

  level: JobLevelDTO | null;
  assignedUsersCount: number;

  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};
