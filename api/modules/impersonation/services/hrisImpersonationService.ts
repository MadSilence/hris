import { refreshTokenFrom } from "@/api/modules/auth/services/hrisAuthSessionService";
import { hrisApiImpersonationClient } from "@/api/modules/impersonation/clients/hrisApiImpersonationClient";
import { ImpersonateResponse, ImpersonateStartRequest, } from "@/api/modules/impersonation/dto";

/** The body's tokens plus the one the backend sent as a cookie addressed to this server. */
export type ImpersonationSession = ImpersonateResponse & { refreshToken?: string };

export class HrisApiImpersonationService {
  public async start(payload: ImpersonateStartRequest): Promise<ImpersonationSession> {
    const { data, response } = await hrisApiImpersonationClient.start(payload);
    return { ...data, refreshToken: refreshTokenFrom(response) };
  }

  /** Stopping swaps back to the actor's own refresh token, so this side has to carry it too. */
  public async stop(): Promise<ImpersonationSession> {
    const { data, response } = await hrisApiImpersonationClient.stop();
    return { ...data, refreshToken: refreshTokenFrom(response) };
  }
}

export const hrisApiImpersonationService = new HrisApiImpersonationService();
