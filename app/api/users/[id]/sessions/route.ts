import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisUserAccountService } from "@/api/modules/userAccount/services";

type RouteContext = { params: Promise<{ id: string }> };

/** A person's live sessions, for Manage account. Java decides who may read them (PEOPLE.PROFILE BLOCK). */
export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return NextResponse.json(await hrisUserAccountService.sessions(id));
});
