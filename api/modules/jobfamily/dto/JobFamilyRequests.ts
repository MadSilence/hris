export type CreateJobFamilyRequest = {
  name: string;
  description?: string | null;
};

export type UpdateJobFamilyRequest = {
  id: string;
  name?: string;
  description?: string | null;
  clearDescription?: boolean;
};

export type DuplicateJobFamilyRequest = {
  id: string;
  name: string;
};

/** Archive, activate and delete all take nothing but the id. */
export type JobFamilyIdRequest = {
  id: string;
};
