import type { PersonDeleteImpactDTO } from "@/api/modules/users/clients/hrisApiUsersClient";
import { User } from "@/models/user/User";
import {
  hrisApiUsersClient,
  type TerminatePayload,
  type TerminationImpactDTO,
  type PatchUserPayload,
  type CreateUserPayload,
  type InviteUserPayload,
  type InviteStateDTO,
} from "@/api/modules/users/clients/hrisApiUsersClient";
import { CreateResponse } from "@/api/models/misc";
import { FieldDTO, UsersSearchRequest, UsersSearchResponseDTO } from "@/models/user/fields";
import { OrgChartUser } from "@/models/orgChart/OrgChartUser";
import type { PeopleExportRequest } from "@/models/user/peopleExport";

export type GetUsersArgs = {
  limit?: number;
  cursor?: string | null;
  q?: string;
  sortField?: string;
  sortDir?: "asc" | "desc";
  selectedFields?: string[] | null;
};

export type UsersSearchArgs = GetUsersArgs & {
  /** See `DraftVisibility` in `models/user/fields` — omitted means the employees, as before. */
  drafts?: "EXCLUDE" | "INCLUDE" | "ONLY" | null;
  filters?: Array<{
    field: "first_name" | "last_name" | "email" | "status" | "created_at" | "updated_at" | "is_email_verified";
    op: "eq" | "neq" | "contains" | "starts_with" | "in" | "before" | "after" | "between";
    value?: string;
    valueTo?: string;
    values?: string[];
  }>;
};

export class HrisApiUsersService {
  public async getUsers(
    args?: GetUsersArgs
  ): Promise<User[] | { items: User[]; nextCursor?: string | null }> {
    return await hrisApiUsersClient.getUsers(args);
  }

  public async getUser(id: string): Promise<User> {
    return hrisApiUsersClient.getUser(id);
  }

  public async createUser(payload: CreateUserPayload): Promise<CreateResponse> {
    return hrisApiUsersClient.createUser(payload);
  }

  public async getDrafts(): Promise<User[]> {
    return hrisApiUsersClient.getDrafts();
  }

  public async invite(id: string, payload: InviteUserPayload): Promise<InviteStateDTO> {
    return hrisApiUsersClient.invite(id, payload);
  }

  public async cancelInvite(id: string): Promise<InviteStateDTO> {
    return hrisApiUsersClient.cancelInvite(id);
  }

  /** The profile's one write — see `PatchUserPayload`. */
  public async patchUser(id: string, payload: PatchUserPayload): Promise<void> {
    return hrisApiUsersClient.patchUser(id, payload);
  }

  public async changeStatus(id: string, status: string): Promise<void> {
    return hrisApiUsersClient.changeStatus(id, status);
  }

  public async getTerminationImpact(id: string, lastWorkingDay?: string | null): Promise<TerminationImpactDTO> {
    return hrisApiUsersClient.getTerminationImpact(id, lastWorkingDay);
  }

  public async getDeleteImpact(id: string): Promise<PersonDeleteImpactDTO> {
    return hrisApiUsersClient.getDeleteImpact(id);
  }

  public async terminate(id: string, payload: TerminatePayload): Promise<void> {
    return hrisApiUsersClient.terminate(id, payload);
  }

  public async deleteUser(id: string): Promise<void> {
    return hrisApiUsersClient.deleteUser(id);
  }

  public async block(id: string, reason?: string | null): Promise<void> {
    return hrisApiUsersClient.block(id, reason);
  }

  public async unblock(id: string, reason?: string | null): Promise<void> {
    return hrisApiUsersClient.unblock(id, reason);
  }

  public async sendPasswordReset(id: string): Promise<void> {
    return hrisApiUsersClient.sendPasswordReset(id);
  }

  public async updateUserAttributes(
    id: string,
    values: Record<string, unknown>
  ): Promise<void> {
    return hrisApiUsersClient.updateUserAttributes(id, values);
  }

  public async searchUsers(
    args: UsersSearchArgs
  ): Promise<{ items: User[]; nextCursor?: string | null }> {
    return hrisApiUsersClient.searchUsers(args);
  }

  async draftCount(): Promise<{ count: number }> {
    return hrisApiUsersClient.draftCount();
  }

  async exportUsers(body: PeopleExportRequest): Promise<Response> {
    return hrisApiUsersClient.exportUsers(body);
  }

  async getFields(): Promise<FieldDTO[]> {
    return hrisApiUsersClient.getFields();
  }

  async search(body: UsersSearchRequest): Promise<UsersSearchResponseDTO> {
    return hrisApiUsersClient.search(body);
  }

  async orgChart(): Promise<OrgChartUser[]> {
    return hrisApiUsersClient.orgChart();
  }

  async setManager(userId: string, managerId: string | null): Promise<void> {
    return hrisApiUsersClient.setManager(userId, managerId);
  }

  async insertManagerAbove(userId: string, managerId: string): Promise<void> {
    return hrisApiUsersClient.insertManagerAbove(userId, managerId);
  }
}

export const hrisApiUsersService = new HrisApiUsersService();
