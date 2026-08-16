/**
 * What deleting a role would cost. `peopleLosingLastRole` is the number that matters: those people
 * would be left with the default role only, i.e. unable to work.
 */
export type RoleDeleteImpactDTO = {
  roleName: string;
  peopleCount: number;
  peopleLosingLastRole: number;
  /** Past bulk hand-outs of this role. History, not standing rules — nothing re-fires. */
  bulkAssignmentCount: number;
};
