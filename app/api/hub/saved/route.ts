import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiHubService } from "@/api/modules/hub/services";

/** The reader's saved posts and pages. */
export const GET = apiRequestWrapper(async () => NextResponse.json(await hrisApiHubService.saved()));
