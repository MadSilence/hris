import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { demoService } from "@/api/modules/demo/demoService";

/** Where going live stands; `null` when nobody has asked (DEMO_PLAN.md 6.6). */
export const GET = apiRequestWrapper(async () => NextResponse.json(await demoService.goLiveStatus()));
