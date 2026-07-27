// Single source of truth for user statuses. The backend stores status as a free string
// (no enum), so this is the canonical UI list — use it everywhere instead of hardcoding.
export const USER_STATUSES = ["ACTIVE", "PENDING", "ARCHIVED"] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

const LABELS: Record<string, string> = {
  ACTIVE: "Active",
  PENDING: "Pending",
  ARCHIVED: "Archived",
};

// Human label for a status; capitalizes unknown values rather than dropping them.
export const formatUserStatus = (status?: string | null): string => {
  if (!status) return "";
  return LABELS[status.toUpperCase()] ?? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

export const isActiveStatus = (status?: string | null): boolean =>
  (status ?? "").toUpperCase() === "ACTIVE";
