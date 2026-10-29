import { internalApiClient } from "@/components/clients/apiClient";
import type { SearchParams, SearchResponse } from "@/models/search";

export class SearchService {
  public async search({ q, kinds, limit }: SearchParams): Promise<SearchResponse> {
    const params = new URLSearchParams({ q });
    if (kinds && kinds.length > 0) params.set("kinds", kinds.join(","));
    if (limit !== undefined) params.set("limit", String(limit));
    return internalApiClient.get<SearchResponse>(`/search?${params.toString()}`);
  }
}

export const searchService = new SearchService();
