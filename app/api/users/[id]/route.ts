import { NextRequest } from "next/server";
import { hrisApiUsersService } from "@/api/modules/users/services/hrisUsersService";

export async function GET(_req: NextRequest, context: { params: { id: string } }) {
  const user = await hrisApiUsersService.getUser(context.params.id);
  return Response.json(user);
}
