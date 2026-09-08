import type {
  TimeOffRestrictionBehavior,
  TimeOffRestrictionRecurrence,
  TimeOffRestrictionScope,
  TimeOffRestrictionType,
} from "./TimeOffPolicyRestrictionDTO";

/** The policy's whole restriction list, replaced — the screen edits the set, not the rows. */
export interface UpdateTimeOffPolicyRestrictionsRequest {
  restrictions: TimeOffPolicyRestrictionItem[];
}

export interface TimeOffPolicyRestrictionItem {
  restrictionType: TimeOffRestrictionType;
  scope: TimeOffRestrictionScope;
  behavior: TimeOffRestrictionBehavior;
  name: string | null;
  startDate: string | null;
  endDate: string | null;
  recurrence: TimeOffRestrictionRecurrence;
  maxUsersAway: number | null;
}
