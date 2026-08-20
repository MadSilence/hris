/** A grade inside a career track (`JobLevelGroup`). Mirrors the backend `JobLevel`. */
export type JobLevel = {
  id: string;
  name: string;
  /** Position within the group; absent on the trimmed projection nested in a Job. */
  sortOrder?: number;
  isSystem?: boolean;

  groupId?: string;
  groupName?: string;

  /** Counters are filled on the catalogue read, not on the picker projection. */
  assignedJobsCount?: number;
  assignedUsersCount?: number;
};
