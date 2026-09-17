import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { UserDTO } from "@/api/modules/users/dto";
import { GetUsersArgs, UsersSearchArgs } from "@/api/modules/users/services/hrisUsersService";
import { userMapper } from "@/api/modules/users/mappers/userMapper";
import { FieldDTO, UsersSearchRequest, UsersSearchResponseDTO } from "@/models/user/fields";
import { User } from "@/models/user/User";
import { OrgChartUser } from "@/models/orgChart/OrgChartUser";
import { CreateResponse } from "@/api/models/misc";

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
  /** The day the effects land — the last working day asked about, or the recorded one. */
  effectiveOn?: string | null;
  /** Approved leave running past the last working day: cancelled, or cut at that day, when it applies. */
  approvedLeaveAfterLastDay?: number;
  /** Requests waiting on this person's decision, which nobody else can answer once their roles go. */
  requestsAwaitingTheirDecision?: number;
};

/** What deleting a profile takes with it, and the refusal waiting for it if there is one. */
export type PersonDeleteImpactDTO = {
  name: string;
  /** Null when Delete may go ahead; otherwise the code that will refuse it (U00022, U00023, U00024). */
  refusal: string | null;
  approverInPolicies: string[];
  timeOffRequests: number;
  balances: number;
  policyAssignments: number;
  assignmentRecords: number;
  jobHistoryEntries: number;
  documentsToTrash: number;
  processesDeleted: number;
  approvalsSignedForOthers: number;
  directReports: number;
  reportsMoveTo: string | null;
};

/** A new person needs a first and last name; everything else is optional and a draft is the result. */
export type CreateUserPayload = {
  firstName: string;
  lastName: string;
  email?: string | null;
  hireDate?: string | null;
};

/** Invite now (no `sendOn`) or on a day; `email` fills a missing address or corrects it. */
export type InviteUserPayload = {
  email?: string | null;
  sendOn?: string | null;
  /** Required only when the person has an unfinished preboarding. */
  preboarding?: "KEEP" | "END" | null;
};

export type InviteStateDTO = {
  accountStatus: string;
  inviteSentAt: string | null;
  scheduledFor: string | null;
};

/** Partial patch: an omitted field is left as is (the backend never clears from here). */
export type UpdateUserPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  hireDate?: string;
  probationEnd?: string;
  /** The version the profile was opened at. */
  version?: number;
};

export class HrisApiUsersClient {
  private readonly BASE_PATH: string = '/users';

  // Returns mapped models, not DTOs — the signature used to say DTO and was papered over with a cast.
  public async getUsers(
    args?: GetUsersArgs
  ): Promise<User[] | { items: User[]; nextCursor?: string | null }> {
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
    };
  }

  public async getUser(id: string) {
    const dto = await hrisApiClient.get<UserDTO>(`${this.BASE_PATH}/${id}`);
    return userMapper.mapUserDTOtoUser(dto);
  }

  public async getCurrentUser(): Promise<User> {
    const dto = await hrisApiClient.get<UserDTO>(`${this.BASE_PATH}/me`);
    return userMapper.mapUserDTOtoUser(dto);
  }

  public async createUser(payload: CreateUserPayload): Promise<CreateResponse> {
    return hrisApiClient.post<CreateResponse>(`${this.BASE_PATH}/create`, { ...payload });
  }

  /** People who exist only as a draft — every other list leaves them out. */
  public async getDrafts(): Promise<User[]> {
    const res = await hrisApiClient.get<UserDTO[]>(`${this.BASE_PATH}/drafts`);
    return res.map((u) => userMapper.mapUserDTOtoUser(u));
  }

  public async invite(id: string, payload: InviteUserPayload): Promise<InviteStateDTO> {
    return hrisApiClient.post<InviteStateDTO>(`${this.BASE_PATH}/${id}/invite`, { ...payload });
  }

  public async cancelInvite(id: string): Promise<InviteStateDTO> {
    return hrisApiClient.post<InviteStateDTO>(`${this.BASE_PATH}/${id}/invite/cancel`);
  }

  public async updateUser(id: string, payload: UpdateUserPayload): Promise<void> {
    await hrisApiClient.post<void>(`${this.BASE_PATH}/${id}/update`, { ...payload });
  }

  public async changeStatus(id: string, status: string): Promise<void> {
    await hrisApiClient.post<void>(`${this.BASE_PATH}/${id}/status`, { status });
  }

  public async getTerminationImpact(id: string, lastWorkingDay?: string | null): Promise<TerminationImpactDTO> {
    const query = lastWorkingDay ? `?lastWorkingDay=${encodeURIComponent(lastWorkingDay)}` : "";
    return hrisApiClient.get<TerminationImpactDTO>(`${this.BASE_PATH}/${id}/termination-impact${query}`);
  }

  public async getDeleteImpact(id: string): Promise<PersonDeleteImpactDTO> {
    return hrisApiClient.get<PersonDeleteImpactDTO>(`${this.BASE_PATH}/${id}/delete-impact`);
  }

  public async terminate(id: string, payload: TerminatePayload): Promise<void> {
    await hrisApiClient.post<void>(`${this.BASE_PATH}/${id}/terminate`, { ...payload });
  }

  public async deleteUser(id: string): Promise<void> {
    await hrisApiClient.post<void>(`${this.BASE_PATH}/${id}/delete`);
  }

  /** Ends the person's ability to sign in. `PEOPLE.PROFILE` BLOCK, not MANAGE. */
  public async block(id: string, reason?: string | null): Promise<void> {
    await hrisApiClient.post<void>(`${this.BASE_PATH}/${id}/block`, { reason: reason ?? null });
  }

  public async unblock(id: string, reason?: string | null): Promise<void> {
    await hrisApiClient.post<void>(`${this.BASE_PATH}/${id}/unblock`, { reason: reason ?? null });
  }

  /** Mails the person a link to set a new password — the one thing that lifts a sign-in lock. */
  public async sendPasswordReset(id: string): Promise<void> {
    await hrisApiClient.post<void>(`${this.BASE_PATH}/${id}/password-reset`);
  }

  public async updateUserAttributes(
    id: string,
    values: Record<string, unknown>
  ): Promise<void> {
    await hrisApiClient.post<void>(`${this.BASE_PATH}/${id}/attributes`, { values });
  }

  public async searchUsers(
    args: UsersSearchArgs
  ): Promise<{ items: User[]; nextCursor?: string | null }> {
    const body = {
      limit: args.limit ?? 100,
      cursor: args.cursor ?? null,
      q: args.q ?? null,
      sortField: args.sortField ?? "last_name",
      sortDir: args.sortDir ?? "asc",
      filters: args.filters ?? [],
      selectedFields: args.selectedFields ?? [],
      drafts: args.drafts ?? null,
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

  async draftCount(): Promise<{ count: number }> {
    return hrisApiClient.get<{ count: number }>(`${this.BASE_PATH}/drafts/count`);
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
