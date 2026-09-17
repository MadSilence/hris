import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiUsersService } from "@/api/modules/users/services/hrisUsersService";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  // The counts follow the date being typed, not the one on record.
  const lastWorkingDay = new URL(req.url).searchParams.get("lastWorkingDay");
  const impact = await hrisApiUsersService.getTerminationImpact(id, lastWorkingDay);

  return NextResponse.json(impact);
});
