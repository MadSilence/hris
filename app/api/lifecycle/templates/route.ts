import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiLifecycleService } from "@/api/modules/lifecycle/services";
import type { ProcessType } from "@/models/lifecycle";

export const GET = apiRequestWrapper(async (req: Request) => {
  const type = new URL(req.url).searchParams.get("type") as ProcessType | null;
  return NextResponse.json(await hrisApiLifecycleService.listTemplates(type));
});
