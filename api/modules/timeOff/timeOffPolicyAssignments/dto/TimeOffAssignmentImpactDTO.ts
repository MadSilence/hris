/**
 * What assigning a policy to a set of people would produce, before it is produced.
 *
 * Both lists are reasons the assignment would be accepted and useless, and neither is visible on the
 * policy screen — both are properties of the policy/person pair rather than of the policy.
 */
export interface TimeOffAssignmentImpactDTO {
  selected: number;
  /** People whose approval chain resolves to nobody — a MANAGER step and no manager. */
  withoutApprover: AffectedPersonDTO[];
  /** People with no hire date, on a policy that renews on the hire anniversary. */
  withoutHireDate: AffectedPersonDTO[];
}

export interface AffectedPersonDTO {
  userId: string;
  firstName: string | null;
  lastName: string | null;
}
