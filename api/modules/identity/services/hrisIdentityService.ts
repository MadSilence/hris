import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  IdentityConnectionDTO,
  IdentityConnectionUpdate,
  IdpGroupDTO,
  IssuedScimToken,
  ScimTokenDTO,
  TestResultDTO,
} from "@/api/modules/identity/dto";

const BASE = "/settings/identity";

/** `/settings/identity/*` — the connection, its SCIM tokens and the group mapping. */
export class HrisIdentityService {
  public connection() {
    return hrisApiClient.get<IdentityConnectionDTO>(`${BASE}/connection`);
  }

  public saveConnection(body: IdentityConnectionUpdate) {
    return hrisApiClient.put<IdentityConnectionDTO, IdentityConnectionUpdate>(`${BASE}/connection`, body);
  }

  /** *Remove* (E-Q9): the connection and every link it carried. */
  public async removeConnection() {
    await hrisApiClient.delete<void>(`${BASE}/connection`);
  }

  /** One person's link to the company's provider (E-Q9). */
  public async unlinkPerson(userId: string) {
    await hrisApiClient.delete<void>(`${BASE}/links/${userId}`);
  }

  public test() {
    return hrisApiClient.post<TestResultDTO>(`${BASE}/connection/test`);
  }

  public tokens() {
    return hrisApiClient.get<ScimTokenDTO[]>(`${BASE}/scim-tokens`);
  }

  public issueToken(expiresInMonths: number) {
    return hrisApiClient.post<IssuedScimToken>(`${BASE}/scim-tokens`, { expiresInMonths });
  }

  public async revokeToken(id: string) {
    await hrisApiClient.post<void>(`${BASE}/scim-tokens/${id}/revoke`);
  }

  public groups() {
    return hrisApiClient.get<IdpGroupDTO[]>(`${BASE}/groups`);
  }

  public mapGroup(groupId: string, roleIds: string[]) {
    return hrisApiClient.put<IdpGroupDTO, { roleIds: string[] }>(`${BASE}/groups/${groupId}/roles`, { roleIds });
  }
}

export const hrisIdentityService = new HrisIdentityService();
