import { hrisApiUserAccountClient } from "@/api/modules/userAccount/clients";
import type { AccountOverviewDTO, PersonSessionDTO, SignInProvider } from "@/api/modules/userAccount/dto";

export class HrisUserAccountService {
  public overview(userId: string): Promise<AccountOverviewDTO> {
    return hrisApiUserAccountClient.overview(userId);
  }

  public sessions(userId: string): Promise<PersonSessionDTO[]> {
    return hrisApiUserAccountClient.sessions(userId);
  }

  public endSession(userId: string, sessionId: string): Promise<void> {
    return hrisApiUserAccountClient.endSession(userId, sessionId);
  }

  public unlinkAccount(userId: string, provider: SignInProvider): Promise<void> {
    return hrisApiUserAccountClient.unlinkAccount(userId, provider);
  }
}

export const hrisUserAccountService = new HrisUserAccountService();
