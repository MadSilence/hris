import { JobLevelDTO } from "@/api/modules/jobfamily/dto";

export type JobLevelGroupDTO = {
  id: string;
  name: string;
  isSystem: boolean;
  levels: JobLevelDTO[];
  assignedJobsCount: number;
  assignedUsersCount: number;
};

export type CreateJobLevelGroupRequest = {
  name: string;
};

export type UpdateJobLevelGroupRequest = {
  id: string;
  name: string;
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
