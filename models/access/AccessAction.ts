// Frontend mirror of the backend `Action` enum (com.example.security.access.Action:
// VIEW | EDIT | MANAGE). Same values and order. Kept prefixed as `AccessAction` on purpose —
// bare `Action` would collide with this codebase's pervasive "server action" terminology.
// Do not rename to match the backend; the names differ intentionally, the semantics do not.
export const ACCESS_ACTIONS = ["VIEW", "EDIT", "MANAGE"] as const;

export type AccessAction = (typeof ACCESS_ACTIONS)[number];

// Ordering only — it does NOT imply that a higher action grants a lower one (see canAccess).
// Used to render actions in a stable order and to pick the strongest granted action.
export const ACCESS_ACTION_RANK: Record<AccessAction, number> = {
  VIEW: 1,
  EDIT: 2,
  MANAGE: 3,
};
