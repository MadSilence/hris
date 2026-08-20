export type CreateJobRequest = {
  familyId: string;
  levelId?: string | null;
  name: string;
  code?: string | null;
  description?: string | null;
};

export type UpdateJobRequest = {
  id: string;
  name?: string;
  familyId?: string;
  levelId?: string | null;
  clearLevel?: boolean;
  code?: string | null;
  clearCode?: boolean;
  description?: string | null;
  clearDescription?: boolean;
};

/** Archive, activate and delete all take nothing but the id. */
export type JobIdRequest = {
  id: string;
};
