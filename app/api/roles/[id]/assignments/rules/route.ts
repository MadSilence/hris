import { NextRequest, NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisRoleAssignmentsService } from "@/api/modules/roles/services/hrisRoleAssignmentsService/hrisRoleAssignmentsService";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = apiRequestWrapper(async (req: NextRequest, context: RouteContext) => {
  const { id } = await context.params;
  const { searchParams } = new URL(req.url);

  const data = await hrisRoleAssignmentsService.getRules(id, {
    page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
    size: searchParams.get("size") ? Number(searchParams.get("size")) : undefined,
    sort: searchParams.get("sort") ?? undefined,
  });

  return NextResponse.json(data);
});
