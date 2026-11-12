import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiHubService } from "@/api/modules/hub/services";

/** CH03: what waits for the reader, and what they agreed to. */
export const GET = apiRequestWrapper(async () => NextResponse.json(await hrisApiHubService.agreements()));
