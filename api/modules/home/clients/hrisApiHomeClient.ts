import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type { CelebrationsDTO, WhosOutDTO } from "@/api/modules/home/dto";
import type { WhosOutAudience, WhosOutRange } from "@/models/home";

export class HrisApiHomeClient {
  public async whosOut(range: WhosOutRange, audience: WhosOutAudience): Promise<WhosOutDTO> {
    return hrisApiClient.get<WhosOutDTO>(`/home/whos-out?${new URLSearchParams({ range, audience }).toString()}`);
  }

  public async celebrations(upcoming: boolean): Promise<CelebrationsDTO> {
    return hrisApiClient.get<CelebrationsDTO>(`/home/celebrations?upcoming=${upcoming}`);
  }
}

export const hrisApiHomeClient = new HrisApiHomeClient();
