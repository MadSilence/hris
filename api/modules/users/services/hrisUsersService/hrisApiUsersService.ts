import { User } from "@/models/user/User";
import {
  hrisApiUsersClient,
  type TerminatePayload,
  type TerminationImpactDTO,
  type UpdateUserPayload,
} from "@/api/modules/users/clients/hrisApiUsersClient";
import { FieldDTO, UsersSearchRequest, UsersSearchResponseDTO } from "@/models/user/fields";
import { OrgChartUser } from "@/models/orgChart/OrgChartUser";

export type GetUsersArgs = {
  limit?: number;
  cursor?: string | null;
  q?: string;
  sortField?: string;
  sortDir?: "asc" | "desc";
  selectedFields?: string[] | null;
};

export type UsersSearchArgs = GetUsersArgs & {
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

  public async updateUser(id: string, payload: UpdateUserPayload): Promise<void> {
    return hrisApiUsersClient.updateUser(id, payload);
  }

  public async changeStatus(id: string, status: string): Promise<void> {
    return hrisApiUsersClient.changeStatus(id, status);
  }

  public async getTerminationImpact(id: string): Promise<TerminationImpactDTO> {
    return hrisApiUsersClient.getTerminationImpact(id);
  }

  public async terminate(id: string, payload: TerminatePayload): Promise<void> {
    return hrisApiUsersClient.terminate(id, payload);
  }

  public async deleteUser(id: string): Promise<void> {
    return hrisApiUsersClient.deleteUser(id);
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

  async setJob(userId: string, jobId: string | null): Promise<void> {
    return hrisApiUsersClient.setJob(userId, jobId);
  }

  async setOffice(userId: string, officeId: string | null): Promise<void> {
    return hrisApiUsersClient.setOffice(userId, officeId);
  }

  async setLegalEntity(userId: string, legalEntityId: string | null): Promise<void> {
    return hrisApiUsersClient.setLegalEntity(userId, legalEntityId);
  }
}

export const hrisApiUsersService = new HrisApiUsersService();
