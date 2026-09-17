import { hrisActivityLogService } from "@/api/modules/activityLog/services";
import type { ActivityLogFilters } from "@/models/activityLog";

const FILTER_KEYS = [
  "from",
  "to",
  "module",
  "verb",
  "action",
  "actorUserId",
  "actorType",
  "objectType",
  "targetUserId",
  "search",
] as const;

export class ActivityLogRoutes {
  public async search(req: Request) {
    const url = new URL(req.url);

    // Copied key by key rather than passed through: the query string reaches Java, and a filter
    // nobody declared is a filter nobody has thought about.
    const filters: ActivityLogFilters = {};
    FILTER_KEYS.forEach((key) => {
      const value = url.searchParams.get(key);
      if (value) filters[key] = value;
    });

    const cursor = url.searchParams.get("cursor");
    const limitRaw = url.searchParams.get("limit");
    const limit = limitRaw ? Number(limitRaw) : undefined;

    const data = await hrisActivityLogService.search(
      filters,
      cursor,
      Number.isFinite(limit) ? limit : undefined,
    );
    return Response.json(data);
  }

  public async catalog(_req: Request) {
    return Response.json(await hrisActivityLogService.catalog());
  }

  /** Binary passthrough — the only transport that can stream the file back. */
  public async export(req: Request) {
    const url = new URL(req.url);

    const filters: ActivityLogFilters = {};
    FILTER_KEYS.forEach((key) => {
      const value = url.searchParams.get(key);
      if (value) filters[key] = value;
    });

    const backendResponse = await hrisActivityLogService.export(
      filters,
      url.searchParams.get("format") ?? "csv",
    );
    return new Response(backendResponse.body, {
      status: backendResponse.status,
      headers: {
        "Content-Type": backendResponse.headers.get("content-type") ?? "application/octet-stream",
        "Content-Disposition": backendResponse.headers.get("content-disposition") ?? "attachment",
      },
    });
  }
}

export const activityLogRoutes = new ActivityLogRoutes();
