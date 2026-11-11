import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiAutomationsService } from "@/api/modules/automations/services";

/** Home's Automations widget: the last seven days, today's failures and the next step (the home redesign, Q-6). */
export const GET = apiRequestWrapper(async () => NextResponse.json(await hrisApiAutomationsService.runWeek()));
