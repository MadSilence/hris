import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiPeopleViewsService } from "@/api/modules/peopleViews/services/hrisApiPeopleViewsService";

export const GET = apiRequestWrapper(async (
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) => {
  const { token } = await params;
  const shared = await hrisApiPeopleViewsService.resolveShare(token);
  return NextResponse.json(shared);
});
