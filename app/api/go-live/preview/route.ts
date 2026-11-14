import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { demoService } from "@/api/modules/demo/demoService";

/** The Keep/Delete list and what goes regardless (DEMO_PLAN.md 6.2). */
export const GET = apiRequestWrapper(async () => NextResponse.json(await demoService.goLivePreview()));
