import type { TimeOffCoverageBehavior } from "./TimeOffCoverageBehavior";
import type { TimeOffCoverageScope } from "./TimeOffCoverageScope";

export interface TimeOffPolicyCoverageDTO {
  policyId: string;
  maxUsersAwayEnabled: boolean;
  maxUsersAway: number | null;
  limitScope: TimeOffCoverageScope;
  maxUsersAwayBehavior: TimeOffCoverageBehavior;
}
