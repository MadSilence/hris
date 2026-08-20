export type JobLevelDTO = {
  id: string;
  name: string;
  sortOrder?: number;
  isSystem?: boolean;

  /** Which track the grade belongs to — present on the flat list, absent when nested in a job. */
  groupId?: string;
  groupName?: string;

  /** How many positions sit on this grade, and how many people hold one of them. */
  assignedJobsCount?: number;
  assignedUsersCount?: number;
};
