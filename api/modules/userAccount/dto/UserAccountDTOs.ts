import type { SessionDTO } from "@/api/modules/sessions/dto";

/** Google or Microsoft — a person's own linked account. */
export type SignInProvider = "GOOGLE" | "MICROSOFT";

/**
 * How another person signs in, and whether and since when they are blocked — `GET /users/{id}/account`, behind
 * `PEOPLE.PROFILE` BLOCK over them (Manage account, R13).
 */
export type AccountOverviewDTO = {
  userId: string;
  accountStatus: "DRAFT" | "INVITED" | "ACTIVE" | "BLOCKED";
  /** When the current block was placed; null unless blocked (or blocked before this was recorded). */
  blockedAt: string | null;
  /** PERSON, TERMINATION or SCIM while blocked. */
  blockedBy: string | null;
  /** Locked after repeated failed passwords; a reset link lifts it. */
  locked: boolean;
  /** Sign-in held until then after the first failures; null when not held. */
  loginRestrictedUntil: string | null;
  password: { hasPassword: boolean; changedAt: string | null };
  /** `method` is AUTHENTICATOR_APP while a factor is in use, null otherwise; `required` — the company asks it of them. */
  twoStep: { method: string | null; enrolledAt: string | null; required: boolean };
  linkedAccounts: { provider: SignInProvider; email: string | null; connectedAt: string; lastUsedAt: string | null }[];
  /** They have signed in through the company's identity provider. */
  companySso: boolean;
  /**
   * The viewer may reset their two-step login: false for one's own account, and for a protected one (a System Owner,
   * a holder of a SETTINGS MANAGE right) unless the viewer is a System Owner, or an Admin holding the right and the
   * account is not an owner's (A-5).
   */
  mayReset: boolean;
};

/** Another person's live session — the same shape as one's own; `isCurrent` is never theirs. */
export type PersonSessionDTO = SessionDTO;
