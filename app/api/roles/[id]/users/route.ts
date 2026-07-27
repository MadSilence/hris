import { NextRequest, NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisUserRolesService } from "@/api/modules/roles/services/hrisUserRolesService/hrisUserRolesService";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = apiRequestWrapper(async (req: NextRequest, context: RouteContext) => {
  const { id } = await context.params;
  const { searchParams } = new URL(req.url);

  const data = await hrisUserRolesService.getRoleUsers(id, {
    q: searchParams.get("q"),
    cursor: searchParams.get("cursor"),
    limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
  });

  return NextResponse.json(data);
});
