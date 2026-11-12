import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiEmailService } from "@/api/modules/email/services";

type RouteContext = { params: Promise<{ id: string }> };

/** A person's last emails and their address's block (EM10). Java decides who may read it. */
export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return NextResponse.json(await hrisApiEmailService.personEmails(id));
});
