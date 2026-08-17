import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiUsersService } from "@/api/modules/users/services/hrisUsersService";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { id } = await context.params;
  const impact = await hrisApiUsersService.getTerminationImpact(id);

  return NextResponse.json(impact);
});
