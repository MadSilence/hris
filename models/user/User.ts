export type User = {
  id: string;
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
  /** Assigned roles. Was typed as a single object while the API has always sent a list. */
  roles: { id: string; name: string }[];
  status: string;
  isEmailVerified: boolean;
  jobId?: string | null;
  jobName?: string | null;
  /**
   * Grade of the position the person holds. Read-only everywhere: it is inherited from the job,
   * so there is no write path and no bulk-edit entry for it.
   */
  level?: { id: string; name: string } | null;
  department?: { id: string; name: string } | null;
  teams?: { id: string; name: string }[];
  office?: { id: string; name: string } | null;
  legalEntity?: { id: string; name: string } | null;
  calendars?: { id: string; name: string; year: number }[];
  manager?: { id: string; name: string } | null;
  hireDate?: string | null;
  employmentType?: string | null;
  probationEnd?: string | null;
  terminationDate?: string | null;
  lastLoginAt: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  custom: Record<string, unknown>;
  /**
   * Per-field access the server resolved for *this* caller on *this* target.
   * `MASKED` = a sensitive field the caller may not read: the value arrives already masked.
   */
  fieldAccess?: Record<string, "VIEW" | "EDIT" | "MASKED">;
}
