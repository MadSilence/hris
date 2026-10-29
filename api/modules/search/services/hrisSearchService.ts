import { hrisApiSearchClient } from "@/api/modules/search/clients";
import type { SearchParams, SearchResponse } from "@/models/search";

/**
 * The quick-search window's read. Nothing is filtered here: which kinds and which hits a reader may
 * have is Java's answer (`SearchService`), and a second copy of it would drift.
 */
export class HrisSearchService {
  public async search(params: SearchParams): Promise<SearchResponse> {
    const dto = await hrisApiSearchClient.search(params);
    return {
      groups: dto.groups.map((group) => ({
        kind: group.kind,
        total: group.total,
        truncated: group.truncated,
        items: group.items.map((item) => ({
          id: item.id,
          title: item.title,
          subtitle: item.subtitle,
          avatarUrl: item.avatarUrl,
          status: item.status,
          accountStatus: item.accountStatus,
          parentId: item.parentId,
        })),
      })),
    };
  }
}

export const hrisSearchService = new HrisSearchService();
