// Single source of truth for user statuses. The backend stores status as a free string
// (no enum), so this is the canonical UI list — use it everywhere instead of hardcoding.
//
// Two axes, never one: `status` is employment ("do they work here"), `accountStatus` is access
// ("may they sign in"). A person who has not started yet is PROSPECTIVE; one who exists only as a
// name is a DRAFT on the access axis.
import type { useTranslations } from "next-intl";

type CommonT = ReturnType<typeof useTranslations<"common">>;

export const USER_STATUSES = ["PROSPECTIVE", "ACTIVE", "ARCHIVED"] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

/** A status's label — a key of the `common` catalogue. */
export const USER_STATUS_KEYS = {
  PROSPECTIVE: "userStatus.prospective",
  ACTIVE: "userStatus.active",
  ARCHIVED: "userStatus.archived",
} as const satisfies Record<UserStatus, string>;

const isUserStatus = (value: string): value is UserStatus => (USER_STATUSES as readonly string[]).includes(value);

// Human label for a status, from `t = useTranslations("common")`; capitalizes unknown values rather than dropping them.
export const formatUserStatus = (t: CommonT, status?: string | null): string => {
  if (!status) return "";
  const known = status.toUpperCase();
  return isUserStatus(known) ? t(USER_STATUS_KEYS[known]) : status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

export const isActiveStatus = (status?: string | null): boolean =>
  (status ?? "").toUpperCase() === "ACTIVE";

export const isProspectiveStatus = (status?: string | null): boolean =>
  (status ?? "").toUpperCase() === "PROSPECTIVE";

export const ACCOUNT_STATUSES = ["DRAFT", "INVITED", "ACTIVE", "BLOCKED"] as const;

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

/** An account status's label — a key of the `common` catalogue. */
export const ACCOUNT_STATUS_KEYS = {
  DRAFT: "accountStatus.draft",
  INVITED: "accountStatus.invited",
  ACTIVE: "accountStatus.active",
  BLOCKED: "accountStatus.blocked",
} as const satisfies Record<AccountStatus, string>;

const isAccountStatus = (value: string): value is AccountStatus =>
  (ACCOUNT_STATUSES as readonly string[]).includes(value);

export const formatAccountStatus = (t: CommonT, status?: string | null): string => {
  if (!status) return "";
  const known = status.toUpperCase();
  return isAccountStatus(known) ? t(ACCOUNT_STATUS_KEYS[known]) : status;
};

/** Invite is offered while nobody has set a password: a draft, or somebody invited who has not accepted. */
export const canBeInvited = (accountStatus?: string | null): boolean =>
  accountStatus === "DRAFT" || accountStatus === "INVITED";
