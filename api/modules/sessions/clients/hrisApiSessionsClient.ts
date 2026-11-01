import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type { SessionDTO, SessionsEndedDTO } from "@/api/modules/sessions/dto";

/** `/auth/sessions` — the caller's own sessions — and an administrator's "End all sessions" on a person. */
export class HrisApiSessionsClient {
  public async listMine(): Promise<SessionDTO[]> {
    return hrisApiClient.get<SessionDTO[]>("/auth/sessions");
  }

  public async endMine(id: string): Promise<void> {
    await hrisApiClient.delete<void>(`/auth/sessions/${id}`);
  }

  public async endMyOthers(): Promise<SessionsEndedDTO> {
    return hrisApiClient.post<SessionsEndedDTO>("/auth/sessions/end-others");
  }

  public async endAllOf(userId: string): Promise<SessionsEndedDTO> {
    return hrisApiClient.post<SessionsEndedDTO>(`/users/${userId}/sessions/end-all`);
  }
}

export const hrisApiSessionsClient = new HrisApiSessionsClient();
