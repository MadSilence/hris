import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiHubService } from "@/api/modules/hub/services";
import { feedScopeOf, postTypeOf, textOf } from "@/api/modules/hub/routes";

/** CH02: a page of 20 posts. Copied value by value: what reaches Java is what the list can ask for. */
export const GET = apiRequestWrapper(async (req: Request) => {
  const params = new URL(req.url).searchParams;
  return NextResponse.json(
    await hrisApiHubService.posts({
      scope: feedScopeOf(params),
      type: postTypeOf(params.get("type")),
      q: textOf(params.get("q")),
      cursor: textOf(params.get("cursor")),
    }),
  );
});
