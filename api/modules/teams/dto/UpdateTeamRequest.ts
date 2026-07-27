export interface UpdateTeamRequest {
  name?: string;
  description?: string | null;
  code?: string | null;
  parentId?: string | null;
}
