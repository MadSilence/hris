import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { UserDTO } from "@/api/modules/users/dto";
import { GetUsersArgs, UsersSearchArgs } from "@/api/modules/users/services/hrisUsersService";
import { userMapper } from "@/api/modules/users/mappers/userMapper";
import { FieldDTO, UsersSearchRequest, UsersSearchResponseDTO } from "@/models/user/fields";
import { User } from "@/models/user/User";
import { OrgChartUser } from "@/models/orgChart/OrgChartUser";

export type TerminationReason = "VOLUNTARY" | "INVOLUNTARY" | "END_OF_CONTRACT";

export type TerminatePayload = {
  lastWorkingDay?: string | null;
  reason?: TerminationReason | null;
  rehireEligible?: boolean | null;
  note?: string | null;
};

/** What terminating will change — shown in the confirmation before anything happens. */
export type TerminationImpactDTO = {
  rolesToRevoke: number;
  policyAssignmentsToEnd: number;
  directReportsToReassign: number;
  reportsMoveTo: { id: string; name: string } | null;
};

/** Partial patch: an omitted field is left as is (the backend never clears from here). */
export type UpdateUserPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  hireDate?: string;
  probationEnd?: string;
};

export class HrisApiUsersClient {
  private readonly BASE_PATH: string = '/users';

  public async getUsers(
    args?: GetUsersArgs
  ): Promise<UserDTO[] | { items: UserDTO[]; nextCursor?: string | null }> {
    const params = new URLSearchParams();
    if (args?.limit) params.set("limit", String(args.limit));
    if (args?.cursor) params.set("cursor", args.cursor);
    if (args?.q) params.set("q", args.q);
    if (args?.sortField) params.set("sortField", args.sortField);
    if (args?.sortDir) params.set("sortDir", args.sortDir);

    const path = `${this.BASE_PATH}${params.toString() ? `?${params.toString()}` : ""}`;

    const res = await hrisApiClient.get<{ items: UserDTO[]; nextCursor?: string | null } | UserDTO[]>(path);
    if (Array.isArray(res)) {
      return res.map((u) => userMapper.mapUserDTOtoUser(u));
    }
    return {
      items: res.items.map((u) => userMapper.mapUserDTOtoUser(u)),
      nextCursor: res.nextCursor ?? null,
    } as any;
  }

  public async getUser(id: string) {
    const dto = await hrisApiClient.get<UserDTO>(`${this.BASE_PATH}/${id}`);
    return userMapper.mapUserDTOtoUser(dto);
  }

  public async getCurrentUser(): Promise<User> {
    const dto = await hrisApiClient.get<UserDTO>(`${this.BASE_PATH}/me`);
    return userMapper.mapUserDTOtoUser(dto);
  }

  public async updateUser(id: string, payload: UpdateUserPayload): Promise<void> {
    await hrisApiClient.post<void>(`${this.BASE_PATH}/${id}/update`, { ...payload });
  }

  public async changeStatus(id: string, status: string): Promise<void> {
    await hrisApiClient.post<void>(`${this.BASE_PATH}/${id}/status`, { status });
  }

  public async getTerminationImpact(id: string): Promise<TerminationImpactDTO> {
    return hrisApiClient.get<TerminationImpactDTO>(`${this.BASE_PATH}/${id}/termination-impact`);
  }

  public async terminate(id: string, payload: TerminatePayload): Promise<void> {
    await hrisApiClient.post<void>(`${this.BASE_PATH}/${id}/terminate`, { ...payload });
  }

  public async deleteUser(id: string): Promise<void> {
    await hrisApiClient.post<void>(`${this.BASE_PATH}/${id}/delete`);
  }

  public async updateUserAttributes(
    id: string,
    values: Record<string, unknown>
  ): Promise<void> {
    await hrisApiClient.post<void>(`${this.BASE_PATH}/${id}/attributes`, { values });
  }

  public async searchUsers(
    args: UsersSearchArgs
  ): Promise<{ items: any[]; nextCursor?: string | null }> {
    const body = {
      limit: args.limit ?? 100,
      cursor: args.cursor ?? null,
      q: args.q ?? null,
      sortField: args.sortField ?? "last_name",
      sortDir: args.sortDir ?? "asc",
      filters: args.filters ?? [],
      selectedFields: args.selectedFields ?? [],
    };

    const res = await hrisApiClient.post<{ items: UserDTO[]; nextCursor?: string | null }>(
      `${this.BASE_PATH}/search`,
      body
    );

    return {
      items: res.items.map((u) => userMapper.mapUserDTOtoUser(u)),
      nextCursor: res.nextCursor ?? null,
    };
  }

  async getFields(): Promise<FieldDTO[]> {
    return hrisApiClient.get<FieldDTO[]>(`${this.BASE_PATH}/fields`);
  }

  async search(body: UsersSearchRequest): Promise<UsersSearchResponseDTO> {
    return hrisApiClient.post<UsersSearchResponseDTO>(`${this.BASE_PATH}/search`, body);
  }

  async orgChart(): Promise<OrgChartUser[]> {
    return hrisApiClient.get<OrgChartUser[]>(`${this.BASE_PATH}/org-chart`);
  }

  async setManager(userId: string, managerId: string | null): Promise<void> {
    await hrisApiClient.post<void>(`${this.BASE_PATH}/${userId}/manager`, { managerId });
  }

  /**
   * Org associations. Each has an assign (PUT) and a clear (DELETE) endpoint rather than a nullable
   * body, so `null` here means "clear" and maps onto the DELETE.
   */
  async setJob(userId: string, jobId: string | null): Promise<void> {
    if (jobId === null) {
      await hrisApiClient.delete<void>(`${this.BASE_PATH}/${userId}/job`);
      return;
    }
    await hrisApiClient.put<void>(`${this.BASE_PATH}/${userId}/job`, { jobId });
  }

  async setOffice(userId: string, officeId: string | null): Promise<void> {
    if (officeId === null) {
      await hrisApiClient.delete<void>(`${this.BASE_PATH}/${userId}/office`);
      return;
    }
    await hrisApiClient.put<void>(`${this.BASE_PATH}/${userId}/office`, { officeId });
  }

  async setLegalEntity(userId: string, legalEntityId: string | null): Promise<void> {
    if (legalEntityId === null) {
      await hrisApiClient.delete<void>(`${this.BASE_PATH}/${userId}/legal-entity`);
      return;
    }
    await hrisApiClient.put<void>(`${this.BASE_PATH}/${userId}/legal-entity`, { legalEntityId });
  }
}

export const hrisApiUsersClient = new HrisApiUsersClient();
