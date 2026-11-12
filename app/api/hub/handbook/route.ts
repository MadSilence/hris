import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiHubService } from "@/api/modules/hub/services";

/** CP01: every section the reader can see. */
export const GET = apiRequestWrapper(async () => NextResponse.json(await hrisApiHubService.handbook()));
