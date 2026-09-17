import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiUsersService } from "@/api/modules/users/services/hrisUsersService";

type RouteContext = { params: Promise<{ id: string }> };

/** What deleting the profile takes with it, and whether it will be refused. */
export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return NextResponse.json(await hrisApiUsersService.getDeleteImpact(id));
});
