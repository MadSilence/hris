import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type { AccountOverviewDTO, PersonSessionDTO, SignInProvider } from "@/api/modules/userAccount/dto";

/** `/users/{id}/account`, `/sessions` and `/sign-in/accounts` — another person's sign-in, for Manage account. */
export class HrisApiUserAccountClient {
  public async overview(userId: string): Promise<AccountOverviewDTO> {
    return hrisApiClient.get<AccountOverviewDTO>(`/users/${encodeURIComponent(userId)}/account`);
  }

  public async sessions(userId: string): Promise<PersonSessionDTO[]> {
    return hrisApiClient.get<PersonSessionDTO[]>(`/users/${encodeURIComponent(userId)}/sessions`);
  }

  public async endSession(userId: string, sessionId: string): Promise<void> {
    await hrisApiClient.delete<void>(
      `/users/${encodeURIComponent(userId)}/sessions/${encodeURIComponent(sessionId)}`,
    );
  }

  public async unlinkAccount(userId: string, provider: SignInProvider): Promise<void> {
    await hrisApiClient.delete<void>(`/users/${encodeURIComponent(userId)}/sign-in/accounts/${provider}`);
  }
}

export const hrisApiUserAccountClient = new HrisApiUserAccountClient();
