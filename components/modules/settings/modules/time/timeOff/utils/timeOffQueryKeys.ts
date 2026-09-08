export const TIME_OFF_QUERY_KEY = "timeOff";

export const getLeaveTypesQueryKey = () => [TIME_OFF_QUERY_KEY, "leaveTypes"];

export const getLeaveTypeQueryKey = (leaveTypeId: string) => [
  TIME_OFF_QUERY_KEY,
  "leaveTypes",
  leaveTypeId,
];

export const getTimeOffPoliciesQueryKey = () => [TIME_OFF_QUERY_KEY, "policies"];

export const getTimeOffPolicyQueryKey = (policyId: string) => [
  TIME_OFF_QUERY_KEY,
  "policies",
  policyId,
];

export const getTimeOffPolicyApprovalSettingsQueryKey = (policyId: string) => [
  TIME_OFF_QUERY_KEY,
  "policies",
  policyId,
  "approvalSettings",
];

export const getTimeOffPolicyRequestRulesQueryKey = (policyId: string) => [
  TIME_OFF_QUERY_KEY,
  "policies",
  policyId,
  "requestRules",
];

export const getTimeOffPolicyEditRulesQueryKey = (policyId: string) => [
  TIME_OFF_QUERY_KEY,
  "policies",
  policyId,
  "editRules",
];

export const getTimeOffPolicyEligibilityQueryKey = (policyId: string) => [
  TIME_OFF_QUERY_KEY,
  "policies",
  policyId,
  "eligibility",
];

export const getTimeOffPolicyCoverageQueryKey = (policyId: string) => [
  TIME_OFF_QUERY_KEY,
  "policies",
  policyId,
  "coverage",
];

export const getTimeOffPolicyAccrualQueryKey = (policyId: string) => [
  TIME_OFF_QUERY_KEY,
  "policies",
  policyId,
  "accrual",
];

export const getTimeOffPolicyBlackoutsQueryKey = (policyId: string) => [
  TIME_OFF_QUERY_KEY,
  "policies",
  policyId,
  "blackouts",
];

export const getTimeOffPolicyTenureRulesQueryKey = (policyId: string) => [
  TIME_OFF_QUERY_KEY,
  "policies",
  policyId,
  "tenureRules",
];

export const getBalanceAsOfQueryKey = (balanceId: string, date: string) => [
  TIME_OFF_QUERY_KEY,
  "balances",
  balanceId,
  "asOf",
  date,
];

export const getTimeOffPolicyEditImpactQueryKey = (policyId: string) => [
  TIME_OFF_QUERY_KEY,
  "policies",
  policyId,
  "editImpact",
];

export const getTimeOffPolicyRestrictionsQueryKey = (policyId: string) => [
  TIME_OFF_QUERY_KEY,
  "policies",
  policyId,
  "restrictions",
];

export const getTimeOffPolicyAssignmentsQueryKey = (policyId: string) => [
  TIME_OFF_QUERY_KEY,
  "policies",
  policyId,
  "assignments",
];

export const getTimeOffAssignmentImpactQueryKey = (
  policyId: string,
  userIds: string[],
) => [
  TIME_OFF_QUERY_KEY,
  "policies",
  policyId,
  "assignments",
  "impact",
  [...userIds].sort().join(","),
];

export const getEmployeeTimeOffBalanceQueryKey = (balanceId: string) => [
  TIME_OFF_QUERY_KEY,
  "balances",
  balanceId,
];

export const getEmployeeTimeOffBalancesByUserQueryKey = (userId: string) => [
  TIME_OFF_QUERY_KEY,
  "balances",
  "user",
  userId,
];

export const getEmployeeTimeOffBalanceTransactionsQueryKey = (
  balanceId: string
) => [TIME_OFF_QUERY_KEY, "balances", balanceId, "transactions"];

export const getTimeOffRequestQueryKey = (requestId: string) => [
  TIME_OFF_QUERY_KEY,
  "requests",
  requestId,
];

export const getTimeOffRequestsByUserQueryKey = (
  userId: string,
  filters?: { year?: number | null; status?: string | null },
) => [
  TIME_OFF_QUERY_KEY,
  "requests",
  "user",
  userId,
  // In the key, so changing a filter refetches rather than showing the previous answer. Invalidating
  // by the prefix above still clears every filtered variant at once.
  filters?.year ?? null,
  filters?.status ?? null,
];

export const getTimeOffRequestsAwaitingMeQueryKey = () => [
  TIME_OFF_QUERY_KEY,
  "requests",
  "awaitingMe",
];
