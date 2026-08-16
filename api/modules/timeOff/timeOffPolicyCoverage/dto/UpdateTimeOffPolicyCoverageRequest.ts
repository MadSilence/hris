import type { TimeOffCoverageBehavior } from "./TimeOffCoverageBehavior";
import type { TimeOffCoverageScope } from "./TimeOffCoverageScope";

export interface UpdateTimeOffPolicyCoverageRequest {
  maxUsersAwayEnabled: boolean;
  maxUsersAway: number | null;
  limitScope: TimeOffCoverageScope;
  maxUsersAwayBehavior: TimeOffCoverageBehavior;
}
