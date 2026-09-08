import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { ImpersonateResponse, ImpersonateStartRequest, } from "@/api/modules/impersonation/dto";

/**
 * Both calls answer with a `Set-Cookie` carrying a refresh token, so both need the response and not
 * just the body — the same reason login and refresh use `postWithResponse`.
 *
 * Using the plain `post` here dropped that header on the floor, so an impersonated session kept the
 * **actor's** refresh token and silently became the actor on its first renewal, with the banner
 * still reading "Stop Impersonation". That is the defect the backend fix was written for; it was
 * closed on the backend and left open one layer up, where nothing forwarded the cookie.
 */
class HrisApiImpersonationClient {
  private readonly API_AUTH_PATH = "/auth";

  public async start(
    payload: ImpersonateStartRequest
  ): Promise<{ data: ImpersonateResponse; response: Response }> {
    return hrisApiClient.postWithResponse<ImpersonateResponse>(
      this.API_AUTH_PATH + "/impersonate/start",
      payload
    );
  }

  public async stop(): Promise<{ data: ImpersonateResponse; response: Response }> {
    return hrisApiClient.postWithResponse<ImpersonateResponse>(
      this.API_AUTH_PATH + "/impersonate/stop"
    );
  }
}

export const hrisApiImpersonationClient = new HrisApiImpersonationClient();
