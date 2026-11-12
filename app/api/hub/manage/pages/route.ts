import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiHubService } from "@/api/modules/hub/services";

/** CM03: the handbook as a tree. */
export const GET = apiRequestWrapper(async () => NextResponse.json(await hrisApiHubService.pageTree()));
