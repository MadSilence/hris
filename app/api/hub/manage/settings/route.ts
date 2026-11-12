import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiHubService } from "@/api/modules/hub/services";

/** CM04. */
export const GET = apiRequestWrapper(async () => NextResponse.json(await hrisApiHubService.settings()));
