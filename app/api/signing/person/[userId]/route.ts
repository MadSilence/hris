import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiSigningService } from "@/api/modules/signing/services";

type RouteContext = { params: Promise<{ userId: string }> };

/** The signings of one person's documents (documents-send-for-signature S06–S08): the tab's pills and panels. */
export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { userId } = await context.params;
  return Response.json(await hrisApiSigningService.forPerson(userId));
});
