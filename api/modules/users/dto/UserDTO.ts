export type UserDTO = {
  id: string;
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: { id: string; name: string }[];
  status: string;
  isEmailVerified: boolean;
  jobId?: string | null;
  jobName?: string | null;
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
  fieldAccess?: Record<string, "VIEW" | "EDIT" | "MASKED">;
}
