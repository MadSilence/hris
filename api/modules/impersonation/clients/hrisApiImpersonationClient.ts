import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { ImpersonateResponse, ImpersonateStartRequest, } from "@/api/modules/impersonation/dto";

class HrisApiImpersonationClient {
  private readonly API_AUTH_PATH = "/auth";

  public async start(payload: ImpersonateStartRequest): Promise<ImpersonateResponse> {
    return hrisApiClient.post<ImpersonateResponse>(
      this.API_AUTH_PATH + "/impersonate/start",
      payload
    );
  }

  public async stop(): Promise<ImpersonateResponse> {
    return hrisApiClient.post<ImpersonateResponse>(
      this.API_AUTH_PATH + "/impersonate/stop"
    );
  }
}

export const hrisApiImpersonationClient = new HrisApiImpersonationClient();
