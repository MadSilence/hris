import { JobDTO } from "@/api/modules/jobfamily/dto";

export type JobFamilyDTO = {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  archived: boolean;

  jobs: JobDTO[];
  /** Sum over the family's jobs — what the archive/delete dialogs warn about. */
  assignedUsersCount: number;

  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};
