import { JobLevelDTO } from "@/api/modules/jobfamily/dto";

export type JobLevelGroupDTO = {
  id: string;
  name: string;
  levels: JobLevelDTO[];
  assignedJobsCount: number;
  assignedUsersCount: number;
  /** Sent back by the rename form; the backend refuses a save over a newer row (E00409). */
  version?: number;
};

export type CreateJobLevelGroupRequest = {
  name: string;
};

export type UpdateJobLevelGroupRequest = {
  id: string;
  name: string;
  /** The version the form was opened with. */
  version?: number;
};

export type ReorderJobLevelsRequest = {
  groupId: string;
  /** Every level of the group, top rung first — the backend rejects a partial list. */
  levelIds: string[];
};

/** Delete takes nothing but the id. */
export type JobLevelGroupIdRequest = {
  id: string;
};
