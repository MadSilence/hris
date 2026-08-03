import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiPeopleViewsService } from "@/api/modules/peopleViews/services/hrisApiPeopleViewsService";

export const GET = apiRequestWrapper(async () => {
  const views = await hrisApiPeopleViewsService.list();
  return NextResponse.json(views);
});
