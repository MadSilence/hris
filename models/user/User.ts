export type User = {
  id: string;
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: {
    id: string;
    name: string;
  }
  status: string;
  isEmailVerified: boolean;
  jobId?: string | null;
  jobName?: string | null;
  department?: { id: string; name: string } | null;
  teams?: { id: string; name: string }[];
  office?: { id: string; name: string } | null;
  legalEntity?: { id: string; name: string } | null;
  calendars?: { id: string; name: string; year: number }[];
  lastLoginAt: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  custom: Map<string, object>;
  fieldAccess?: Record<string, "VIEW" | "EDIT">;
}
