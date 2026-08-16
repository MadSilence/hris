export interface UpdateTimeOffPolicyBlackoutRequest {
  name: string | null;
  startDate: string;
  endDate: string;
}

export interface UpdateTimeOffPolicyBlackoutsRequest {
  blackouts: UpdateTimeOffPolicyBlackoutRequest[];
}
