import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiAutomationsService } from "@/api/modules/automations/services";
import type { RunQuery } from "@/models/automations";

/** A read with a body: Activity's and the run history's search carries the Filters builder's segment. */
export const POST = apiRequestWrapper(async (req: Request) => {
  const query = (await req.json()) as RunQuery;
  return NextResponse.json(await hrisApiAutomationsService.runs(query));
});
