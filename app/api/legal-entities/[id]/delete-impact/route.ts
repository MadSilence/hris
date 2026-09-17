import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { legalEntityService } from "@/api/modules/legalEntity/services/legalEntityService";

type RouteContext = { params: Promise<{ id: string }> };

/** Who deleting the legal entity detaches — read before the dialog offers Delete. */
export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return NextResponse.json(await legalEntityService.getDeleteImpact(id));
});
