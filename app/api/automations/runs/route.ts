import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiAutomationsService } from "@/api/modules/automations/services";

/** A person's runs, for the profile. */
export const GET = apiRequestWrapper(async (req: Request) => {
  const params = new URL(req.url).searchParams;
  return NextResponse.json(await hrisApiAutomationsService.personRuns(
    params.get("personId") ?? "",
    Number(params.get("page") ?? 0),
    Number(params.get("size") ?? 20),
  ));
});
