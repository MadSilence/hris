import { hrisApiSessionsClient } from "@/api/modules/sessions/clients";
import type { SessionDTO, SessionsEndedDTO } from "@/api/modules/sessions/dto";

export class HrisSessionsService {
  public async listMine(): Promise<SessionDTO[]> {
    return hrisApiSessionsClient.listMine();
  }

  public async endMine(id: string): Promise<void> {
    return hrisApiSessionsClient.endMine(id);
  }

  public async endMyOthers(): Promise<SessionsEndedDTO> {
    return hrisApiSessionsClient.endMyOthers();
  }

  public async endAllOf(userId: string): Promise<SessionsEndedDTO> {
    return hrisApiSessionsClient.endAllOf(userId);
  }
}

export const hrisSessionsService = new HrisSessionsService();
