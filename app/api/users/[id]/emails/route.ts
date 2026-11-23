import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiEmailService } from "@/api/modules/email/services";

type RouteContext = { params: Promise<{ id: string }> };

const intParam = (value: string | null): number | undefined => {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  return Number.isInteger(n) ? n : undefined;
};

/** A page of a person's emails and their address's block (EM10). Java decides who may read it. */
export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  const params = new URL(req.url).searchParams;
  return NextResponse.json(
    await hrisApiEmailService.personEmails(id, intParam(params.get("page")), intParam(params.get("size"))),
  );
});
