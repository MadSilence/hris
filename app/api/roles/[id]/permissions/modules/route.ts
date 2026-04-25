import { NextRequest } from "next/server";
import { hrisApiRolesService } from "@/api/modules/roles/services/hrisRolesService";

export async function GET(_req: NextRequest, context: { params: { id: string } }) {
  const data = await hrisApiRolesService.getRoleModulePermissions(context.params.id);
  return Response.json(data);
}

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  const body = await req.json().catch(() => ({ modules: {} }));
  await hrisApiRolesService.updateRoleModulePermissions(context.params.id, body);
  return new Response(null, { status: 204 });
}
