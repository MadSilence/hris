// Single source of truth for user statuses. The backend stores status as a free string
// (no enum), so this is the canonical UI list — use it everywhere instead of hardcoding.
//
// Two axes, never one: `status` is employment ("do they work here"), `accountStatus` is access
// ("may they sign in"). A person who has not started yet is PROSPECTIVE; one who exists only as a
// name is a DRAFT on the access axis.
export const USER_STATUSES = ["PROSPECTIVE", "ACTIVE", "ARCHIVED"] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

const LABELS: Record<string, string> = {
  PROSPECTIVE: "Not Started",
  ACTIVE: "Active",
  ARCHIVED: "Archived",
};

// Human label for a status; capitalizes unknown values rather than dropping them.
export const formatUserStatus = (status?: string | null): string => {
  if (!status) return "";
  return LABELS[status.toUpperCase()] ?? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

export const isActiveStatus = (status?: string | null): boolean =>
  (status ?? "").toUpperCase() === "ACTIVE";

export const isProspectiveStatus = (status?: string | null): boolean =>
  (status ?? "").toUpperCase() === "PROSPECTIVE";

export const ACCOUNT_STATUSES = ["DRAFT", "INVITED", "ACTIVE", "BLOCKED"] as const;

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

const ACCOUNT_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  INVITED: "Invited",
  ACTIVE: "Registered",
  BLOCKED: "Blocked",
};

export const formatAccountStatus = (status?: string | null): string =>
  status ? ACCOUNT_LABELS[status.toUpperCase()] ?? status : "";

/** Invite is offered while nobody has set a password: a draft, or somebody invited who has not accepted. */
export const canBeInvited = (accountStatus?: string | null): boolean =>
  accountStatus === "DRAFT" || accountStatus === "INVITED";
