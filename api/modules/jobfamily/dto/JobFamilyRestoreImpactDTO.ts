/** One archived position of the family about to be restored, as `GET /job-families/{id}/restore-impact` lists it. */
export type ArchivedJobOfFamilyDTO = {
  id: string;
  name: string;
  code: string | null;
  /** ISO local date-time. */
  archivedAt: string;
  /** True when archiving the family took it along; false when it was archived on its own. */
  archivedWithFamily: boolean;
};

export type JobFamilyRestoreImpactDTO = {
  archivedJobs: ArchivedJobOfFamilyDTO[];
};
