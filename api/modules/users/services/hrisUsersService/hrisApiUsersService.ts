import { User } from "@/models/user/User";
import { hrisApiUsersClient } from "@/api/modules/users/clients/hrisApiUsersClient";
import { FieldDTO, UsersSearchRequest, UsersSearchResponseDTO } from "@/models/user/fields";

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
}

export const hrisApiUsersService = new HrisApiUsersService();
