import { hrisApiImpersonationClient } from "@/api/modules/impersonation/clients/hrisApiImpersonationClient";
import { ImpersonateResponse, ImpersonateStartRequest, } from "@/api/modules/impersonation/dto";

export class HrisApiImpersonationService {
  public async start(payload: ImpersonateStartRequest): Promise<ImpersonateResponse> {
    return hrisApiImpersonationClient.start(payload);
  }

  public async stop(): Promise<ImpersonateResponse> {
    return hrisApiImpersonationClient.stop();
  }
}

export const hrisApiImpersonationService = new HrisApiImpersonationService();
