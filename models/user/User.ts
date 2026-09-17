/**
 * A person as the API returns them.
 *
 * **A missing field means "withheld", not "empty".** Field access is resolved per caller and per
 * target, and the server leaves out what this caller may not read — so almost everything here is
 * optional, and `fieldAccess` is what says which keys to expect. Only identity is guaranteed: strip
 * the name and every list, picker and chart turns into rows of dashes.
 */
export type User = {
  id: string;
  companyId: string;
  email?: string;
  firstName: string;
  lastName: string;
  /** Assigned roles. Was typed as a single object while the API has always sent a list. */
  roles?: { id: string; name: string }[];
  status?: string;
  /**
   * The access axis — `DRAFT`, `INVITED`, `ACTIVE` or `BLOCKED`. Profile only: it decides which
   * lifecycle actions the profile offers. Lists never carry drafts at all.
   */
  accountStatus?: string;
  /**
   * Locked after too many failed sign-ins — independent of `accountStatus`, which stays ACTIVE.
   * Only a password reset sent from the profile lifts it. Profile only.
   */
  accountLocked?: boolean;
  /** The version the record was read at; an edit sends it back. */
  version?: number;
  /** When the last invitation went out. Profile only. */
  inviteSentAt?: string | null;
  /** The day a scheduled invitation will go out. Profile only. */
  inviteScheduledFor?: string | null;
  isEmailVerified?: boolean;
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
  createdAt?: string;
  updatedAt?: string;
  custom: Record<string, unknown>;
  /**
   * Per-field access the server resolved for *this* caller on *this* target.
   * `MASKED` = a sensitive field the caller may not read: the value arrives already masked.
   */
  fieldAccess?: Record<string, "VIEW" | "EDIT" | "MASKED">;
  /**
   * What the caller may do *to this person*, per resource — `{"PEOPLE.TIME_OFF": ["VIEW"], …}`.
   * Holding a permission and holding it over someone are different questions, and only the server
   * can answer the second: deriving it here from scope names would be a second copy of the
   * permission model, which the security model forbids. Profile only; lists do not carry it.
   */
  capabilities?: Record<string, ("VIEW" | "EDIT" | "MANAGE" | "BLOCK")[]>;
}
