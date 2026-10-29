import { hrisSearchService } from "@/api/modules/search/services";
import { SEARCH_KINDS, type SearchKind } from "@/models/search";

const isKind = (value: string): value is SearchKind => (SEARCH_KINDS as readonly string[]).includes(value);

export class SearchRoutes {
  public async search(req: Request) {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";

    // Copied value by value: what reaches Java is what the window can ask for, nothing more.
    const kinds = (url.searchParams.get("kinds") ?? "")
      .split(",")
      .map((kind) => kind.trim())
      .filter(isKind);
    const limitRaw = url.searchParams.get("limit");
    const limit = limitRaw ? Number(limitRaw) : undefined;

    const data = await hrisSearchService.search({
      q,
      kinds: kinds.length > 0 ? kinds : undefined,
      limit: Number.isFinite(limit) ? limit : undefined,
    });
    return Response.json(data);
  }
}

export const searchRoutes = new SearchRoutes();
