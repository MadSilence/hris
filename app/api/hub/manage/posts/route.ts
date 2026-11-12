import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiHubService } from "@/api/modules/hub/services";
import { postStatusOf, textOf } from "@/api/modules/hub/routes";

/** CM02: every post, by status. */
export const GET = apiRequestWrapper(async (req: Request) => {
  const params = new URL(req.url).searchParams;
  return NextResponse.json(await hrisApiHubService.managePosts(postStatusOf(params.get("status")), textOf(params.get("q"))));
});
