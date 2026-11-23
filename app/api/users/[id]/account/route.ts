import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisUserAccountService } from "@/api/modules/userAccount/services";

type RouteContext = { params: Promise<{ id: string }> };

/** How a person signs in, for Manage account. Java decides who may read it (PEOPLE.PROFILE BLOCK). */
export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return NextResponse.json(await hrisUserAccountService.overview(id));
});
