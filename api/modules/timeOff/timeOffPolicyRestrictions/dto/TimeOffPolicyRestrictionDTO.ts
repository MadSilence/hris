export enum TimeOffRestrictionType {
  /** Nobody may be away over these dates. Date-driven and absolute. */
  Blackout = "BLACKOUT",
  /** No more than N people in scope may be away at once. Capacity-driven. */
  CoverageCap = "COVERAGE_CAP",
}

export enum TimeOffRestrictionRecurrence {
  None = "NONE",
  /** A year-end freeze is a rule, not a date range retyped every December. */
  Yearly = "YEARLY",
}

export enum TimeOffRestrictionScope {
  Team = "TEAM",
  Department = "DEPARTMENT",
  Company = "COMPANY",
}

export enum TimeOffRestrictionBehavior {
  /** Refuse the days that are in the way. */
  Block = "BLOCK",
  /** Let it through and say which days are thin. */
  Warn = "WARN",
}

/**
 * One rule that can stop leave being taken.
 *
 * Blackouts and coverage caps are two different rules and one object: they share a scope, a moment
 * of evaluation, a block-or-warn outcome, and the fact that the honest answer is per day.
 */
export interface TimeOffPolicyRestrictionDTO {
  id: string;
  policyId: string;
  restrictionType: TimeOffRestrictionType;
  scope: TimeOffRestrictionScope;
  behavior: TimeOffRestrictionBehavior;
  name: string | null;
  /** BLACKOUT only. */
  startDate: string | null;
  endDate: string | null;
  recurrence: TimeOffRestrictionRecurrence;
  /** COVERAGE_CAP only. */
  maxUsersAway: number | null;
}
