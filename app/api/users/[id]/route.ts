import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiUsersService } from "@/api/modules/users/services/hrisUsersService";

export const GET = apiRequestWrapper(async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const user = await hrisApiUsersService.getUser(id);

  return NextResponse.json(user);
});
