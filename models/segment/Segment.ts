import type { FilterDTO } from "@/models/user/fields";

// Reusable audience definition. filters use the same DSL as POST /users/search;
// empty filters = every active user. excludeUserIds is subtracted after the filter resolves.
export type Segment = {
  filters: FilterDTO[];
  excludeUserIds: string[];
};

export type UserRoleRefDTO = {
  id: string;
  name: string;
};

// Identity projection returned by the resolver, plus a flexible `extras` bag of extra
// projections requested via `include` (keyed by the same field keys as filters):
//   "roles"       -> UserRoleRefDTO[]
//   "attr:<uuid>" -> string | string[] (only when the caller can view the attribute)
// No filterable field values leak here — extras only carries what was explicitly requested
// and permitted, which is how "don't return values of fields the caller can't see" is met.
export type UserRefDTO = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  avatarUrl?: string | null;
  status?: string | null;
  extras?: Record<string, unknown> | null;
};

// Typed reader for the roles extra.
export const rolesOf = (u: UserRefDTO): UserRoleRefDTO[] =>
  (u.extras?.roles as UserRoleRefDTO[] | undefined) ?? [];

// POST /segments/resolve
export type SegmentResolveResponse = {
  summary: { total: number };
  items: UserRefDTO[];
  nextCursor?: string | null;
};

export const emptySegment = (): Segment => ({ filters: [], excludeUserIds: [] });
