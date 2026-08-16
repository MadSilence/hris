export interface UpdateTimeOffPolicyTenureRuleRequest {
  yearsOfService: number;
  bonusDays: number;
}

export interface UpdateTimeOffPolicyTenureRulesRequest {
  tenureRules: UpdateTimeOffPolicyTenureRuleRequest[];
}
