import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiLifecycleService } from "@/api/modules/lifecycle/services";

export const GET = apiRequestWrapper(async (req: Request) => {
  const includeDone = new URL(req.url).searchParams.get("includeDone") === "true";
  return NextResponse.json(await hrisApiLifecycleService.myTasks(includeDone));
});
