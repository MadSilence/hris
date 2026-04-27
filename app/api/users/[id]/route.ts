import { NextRequest } from "next/server";
import { hrisApiUsersService } from "@/api/modules/users/services/hrisUsersService";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const user = await hrisApiUsersService.getUser(id);

  return Response.json(user);
}
