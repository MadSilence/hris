import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { demoService } from "@/api/modules/demo/demoService";

/** The company's state for the app shell: the trial, the demo, read-only (DEMO_PLAN.md 4.1). */
export const GET = apiRequestWrapper(async () => NextResponse.json(await demoService.state()));
