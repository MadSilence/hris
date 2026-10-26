/** An archived position that may come back with the family being restored. */
export type ArchivedJobOfFamily = {
  id: string;
  name: string;
  code: string | null;
  /** ISO local date-time. */
  archivedAt: string;
  /** True when archiving the family took it along; false when it was archived on its own. */
  archivedWithFamily: boolean;
};

export type JobFamilyRestoreImpact = {
  archivedJobs: ArchivedJobOfFamily[];
};
