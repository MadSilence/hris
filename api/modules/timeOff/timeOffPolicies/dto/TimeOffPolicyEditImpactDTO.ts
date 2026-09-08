/**
 * What is already standing under the rules a policy edit would change.
 *
 * Editing a policy re-prices nothing — a quota dropping from 25 to 20 does not reach back into
 * absences already counted at 25. This is what makes the consequence visible instead.
 */
export interface TimeOffPolicyEditImpactDTO {
  affectedRequests: number;
  /** The subset already under way — the ones a change reaches soonest. */
  inProgressRequests: number;
  affectedPeople: number;
  samplePeople: { userId: string; firstName: string | null; lastName: string | null }[];
}
