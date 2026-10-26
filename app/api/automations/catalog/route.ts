import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiAutomationsService } from "@/api/modules/automations/services";

export const GET = apiRequestWrapper(async () => NextResponse.json(await hrisApiAutomationsService.catalog()));
