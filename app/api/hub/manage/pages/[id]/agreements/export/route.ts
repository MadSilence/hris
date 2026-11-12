import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { streamBinary } from "@/api/utils/exportResponse";
import { hrisApiHubService } from "@/api/modules/hub/services";
import { agreementTabOf } from "@/api/modules/hub/routes";

type RouteContext = { params: Promise<{ id: string }> };

/** CM08 Export: the CSV of the current tab, streamed through. Java journals the export. */
export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return streamBinary(await hrisApiHubService.exportAgreements(id, agreementTabOf(new URL(req.url).searchParams.get("tab"))));
});
