import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiLifecycleService } from "@/api/modules/lifecycle/services";

export const GET = apiRequestWrapper(async (req: Request) => {
  const params = new URL(req.url).searchParams;
  return NextResponse.json(await hrisApiLifecycleService.listProcesses({
    archived: params.get("archived") === "true",
    userId: params.get("userId"),
  }));
});
