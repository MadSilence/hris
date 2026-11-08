import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiAutomationsService } from "@/api/modules/automations/services";

export const GET = apiRequestWrapper(async (req: Request) => {
  const q = new URL(req.url).searchParams.get("q");
  return NextResponse.json(await hrisApiAutomationsService.ownerCandidates(q));
});
