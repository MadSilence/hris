import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiAutomationsService } from "@/api/modules/automations/services";
import type { AssignableType } from "@/models/automations";

/** Who was assigned to one target, by which rule or by hand, and when. */
export const GET = apiRequestWrapper(async (req: Request) => {
  const params = new URL(req.url).searchParams;
  return NextResponse.json(await hrisApiAutomationsService.history(
    params.get("assignableType") as AssignableType,
    params.get("assignableId") ?? "",
    Number(params.get("page") ?? 0),
    Number(params.get("size") ?? 50),
  ));
});
