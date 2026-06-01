export interface CreateTimeOffRequestRequest {
  assignmentId: string;
  startDate: string;
  endDate: string;
  reason: string | null;
}
