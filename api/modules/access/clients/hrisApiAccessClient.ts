import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { MeAccessDTO } from "@/models/access";

class HrisApiAccessClient {
  public async getMeAccess(): Promise<MeAccessDTO> {
    return hrisApiClient.get<MeAccessDTO>("/me/access");
  }
}

export const hrisApiAccessClient = new HrisApiAccessClient();
