import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiLifecycleService } from "@/api/modules/lifecycle/services";

type RouteContext = { params: Promise<{ id: string }> };

/** A task's material file, streamed through: the only transport that can carry one. */
export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { id } = await context.params;
  const backend = await hrisApiLifecycleService.downloadFile(id);
  return new Response(backend.body, {
    status: backend.status,
    headers: {
      "Content-Type": backend.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition": backend.headers.get("content-disposition") ?? "attachment",
    },
  });
});
