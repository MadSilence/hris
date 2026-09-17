// Frontend mirror of the backend `Action` enum (com.example.security.access.Action:
// VIEW | EDIT | MANAGE | BLOCK). Same values and order. Kept prefixed as `AccessAction` on purpose —
// bare `Action` would collide with this codebase's pervasive "server action" terminology.
// Do not rename to match the backend; the names differ intentionally, the semantics do not.
//
// BLOCK — blocking, unblocking and sending a password reset — is supported by PEOPLE.PROFILE alone
// (see resourceRegistry). It was missing here while the backend had it, which made it more than an
// absent column: `buildRolePermissionsPayload` walks the actions listed in ACCESS_ACTION_RANK, so
// saving a role's permissions silently dropped any BLOCK grant it held.
export const ACCESS_ACTIONS = ["VIEW", "EDIT", "MANAGE", "BLOCK"] as const;

export type AccessAction = (typeof ACCESS_ACTIONS)[number];

// Ordering only — it does NOT imply that a higher action grants a lower one (see canAccess).
// Used to render actions in a stable order and to pick the strongest granted action.
export const ACCESS_ACTION_RANK: Record<AccessAction, number> = {
  VIEW: 1,
  EDIT: 2,
  MANAGE: 3,
  BLOCK: 4,
};
