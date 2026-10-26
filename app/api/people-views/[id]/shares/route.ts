import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiPeopleViewsService } from "@/api/modules/peopleViews/services/hrisApiPeopleViewsService";

/** Who a view is shared with — its owner only; the backend refuses anybody else. */
export const GET = apiRequestWrapper(async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  const shares = await hrisApiPeopleViewsService.listShares(id);
  return NextResponse.json(shares);
});
