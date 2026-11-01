import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { streamBinary } from "@/api/utils/exportResponse";
import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";

type Ctx = { params: Promise<{ id: string }> };

/** Everything the company holds about one person, as a ZIP (P17). Streams; Java names the file. */
export const POST = apiRequestWrapper(async (_req: Request, ctx: Ctx) => {
  const { id: userId } = await ctx.params;
  return streamBinary(await hrisApiClient.postForBinary(`/users/${encodeURIComponent(userId)}/personal-data-export`, {}, "application/zip"));
});
