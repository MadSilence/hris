import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { officeService } from "@/api/modules/office/services/officeService";

type RouteContext = { params: Promise<{ id: string }> };

/** Who deleting the office detaches — read before the dialog offers Delete. */
export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return NextResponse.json(await officeService.getDeleteImpact(id));
});
