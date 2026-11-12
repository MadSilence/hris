import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiHubService } from "@/api/modules/hub/services";
import { feedScopeOf } from "@/api/modules/hub/routes";

/** CH01 in one call. */
export const GET = apiRequestWrapper(async (req: Request) =>
  NextResponse.json(await hrisApiHubService.home(feedScopeOf(new URL(req.url).searchParams))),
);
