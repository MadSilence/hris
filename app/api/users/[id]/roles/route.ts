import { NextRequest } from "next/server";
import { hrisUserRolesService } from "@/api/modules/roles/services/hrisUserRolesService/hrisUserRolesService";

export async function GET(_req: NextRequest, context: { params: { id: string } }) {
  const roles = await hrisUserRolesService.getUserRoles(context.params.id);
  return Response.json(roles);
}
