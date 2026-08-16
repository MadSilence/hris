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

export const getTimeOffPolicyAssignmentsQueryKey = (policyId: string) => [
  TIME_OFF_QUERY_KEY,
  "policies",
  policyId,
  "assignments",
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

export const getTimeOffRequestsByUserQueryKey = (userId: string) => [
  TIME_OFF_QUERY_KEY,
  "requests",
  "user",
  userId,
];
