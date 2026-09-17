export type UserDTO = {
  id: string;
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: { id: string; name: string }[];
  status: string;
  accountStatus?: string;
  /** Locked after too many failed sign-ins. Only a password reset sent from the profile lifts it. */
  accountLocked?: boolean;
  /** Sent back by an edit so a save based on a stale read is refused (E00409). */
  version?: number;
  inviteSentAt?: string | null;
  inviteScheduledFor?: string | null;
  isEmailVerified: boolean;
  jobId?: string | null;
  jobName?: string | null;
  /** Grade of the held position — derived by the backend, never written from here. */
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
  fieldAccess?: Record<string, "VIEW" | "EDIT" | "MASKED">;
  /**
   * What the caller may do to *this* person, per resource. Profile-only — the directory does not
   * carry it. Must be mapped through: the tabs and their gate read nothing else, so dropping it
   * here hides Documents and Time Off from everyone, own profile included.
   */
  capabilities?: Record<string, ("VIEW" | "EDIT" | "MANAGE" | "BLOCK")[]>;
}
