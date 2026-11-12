import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiHubService } from "@/api/modules/hub/services";
import { textOf } from "@/api/modules/hub/routes";

/** The ask box: pages and posts the reader may see. */
export const GET = apiRequestWrapper(async (req: Request) => {
  const params = new URL(req.url).searchParams;
  return NextResponse.json(await hrisApiHubService.search(textOf(params.get("q")) ?? "", params.get("pagesOnly") === "true"));
});
