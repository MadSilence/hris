import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiHubService } from "@/api/modules/hub/services";

/** The roles CM04 and CM07's picker offers — behind the hub's right, not the Roles one (B2). */
export const GET = apiRequestWrapper(async () => NextResponse.json(await hrisApiHubService.audienceRoles()));
