import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiHubService } from "@/api/modules/hub/services";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * A hub image, streamed through with the session (design § 6.3): never a public URL, because a cover on a
 * "Vilnius only" post must not be readable by address. Java checks the owning item's visibility.
 */
export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { id } = await context.params;
  const backend = await hrisApiHubService.file(id);
  return new Response(backend.body, {
    status: backend.status,
    headers: {
      "Content-Type": backend.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition": backend.headers.get("content-disposition") ?? "inline",
      // Per person: the answer depends on who asks, so no shared cache may keep it.
      "Cache-Control": "private, max-age=300",
    },
  });
});
