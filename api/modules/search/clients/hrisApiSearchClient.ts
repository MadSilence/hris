import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type { SearchResponseDTO } from "@/api/modules/search/dto";
import type { SearchParams } from "@/models/search";

export class HrisApiSearchClient {
  private readonly PATH = "/search";

  public async search({ q, kinds, limit }: SearchParams): Promise<SearchResponseDTO> {
    const params = new URLSearchParams({ q });
    if (kinds && kinds.length > 0) params.set("kinds", kinds.join(","));
    if (limit !== undefined) params.set("limit", String(limit));
    return hrisApiClient.get<SearchResponseDTO>(`${this.PATH}?${params.toString()}`);
  }
}

export const hrisApiSearchClient = new HrisApiSearchClient();
