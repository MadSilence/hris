export interface UpdateTimeOffPolicyEditRulesRequest {
  employeeCanEditOwnRequests: boolean;
  allowEditApprovedRequests: boolean;
  allowEditDuringActiveLeave: boolean;
  editRequiresReapproval: boolean;
  managerCanEditTeamRequests: boolean;
  adminCanEditAnyRequest: boolean;
  allowPastEdits: boolean;
}
