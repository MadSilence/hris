import { NextRequest } from "next/server";
import { hrisUserRolesService } from "@/api/modules/roles/services/hrisUserRolesService/hrisUserRolesService";

export async function POST(_req: NextRequest, context: { params: { id: string; roleId: string } }) {
  await hrisUserRolesService.assignRole(context.params.id, context.params.roleId);
  return new Response(null, { status: 204 });
}

export async function DELETE(_req: NextRequest, context: { params: { id: string; roleId: string } }) {
  await hrisUserRolesService.removeRole(context.params.id, context.params.roleId);
  return new Response(null, { status: 204 });
}
