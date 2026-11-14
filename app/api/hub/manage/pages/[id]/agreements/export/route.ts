import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { streamBinary } from "@/api/utils/exportResponse";
import { hrisApiHubService } from "@/api/modules/hub/services";
import { agreementTabOf } from "@/api/modules/hub/routes";

type RouteContext = { params: Promise<{ id: string }> };

/** CM08 Export: the CSV of the current tab as filtered, streamed through. Java journals the export. */
export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  const params = new URL(req.url).searchParams;
  // The filters the screen shows (B5): the file is the table the reader is looking at.
  return streamBinary(await hrisApiHubService.exportAgreements(id, agreementTabOf(params.get("tab")), {
    department: params.get("department"),
    office: params.get("office"),
    q: params.get("q"),
  }));
});
