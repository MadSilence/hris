import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiRolesService } from "@/api/modules/roles/services/hrisRolesService";
import { BadRequestError } from "@/api/models/errors/BadRequestError";
import { UpdateRolePermissionsRequest } from "@/api/modules/roles/dto/RolePermissionsDTO";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { id } = await context.params;
  const data = await hrisApiRolesService.getRolePermissions(id);

  return NextResponse.json(data);
});

export const PUT = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;

  // A full replace: never fall back to an empty payload, that would wipe the whole role.
  let body: UpdateRolePermissionsRequest;
  try {
    body = await req.json();
  } catch {
    throw new BadRequestError("Invalid role permissions payload.");
  }

  if (!body || !Array.isArray(body.permissions)) {
    throw new BadRequestError("Invalid role permissions payload.");
  }

  const { accessToken } = await hrisApiRolesService.updateRolePermissions(id, body);

  // Saving rotates perm_hash, which invalidates the acting user's current token.
  // Swap the cookie so the very next request does not 401 (same flow as login).
  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set({
    name: "access_token",
    value: accessToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return res;
});
