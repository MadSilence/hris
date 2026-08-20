import { JobLevel } from "@/models/job/JobLevel";

export type Job = {
  id: string;
  name: string;
  /** Optional company-wide identifier. */
  code: string | null;
  description: string | null;
  isSystem: boolean;
  archived: boolean;

  familyId: string | null;
  familyName: string | null;

  level: JobLevel | null;
  /** How many people currently hold this position. */
  assignedUsersCount: number;

  createdAt?: string;
  createdBy?: string;
};
