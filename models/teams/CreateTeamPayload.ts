export interface CreateTeamPayload {
  name: string;
  description?: string | null;
  code?: string | null;
  parentId?: string | null;
  leadId?: string | null;
}
