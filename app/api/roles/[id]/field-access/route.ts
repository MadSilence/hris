import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiRolesService } from "@/api/modules/roles/services/hrisRolesService";
import { BadRequestError } from "@/api/models/errors/BadRequestError";
import { UpdateRoleFieldAccessRequest } from "@/api/modules/roles/dto/RoleFieldAccessDTO";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { id } = await context.params;
  const data = await hrisApiRolesService.getRoleFieldAccess(id);

  return NextResponse.json(data);
});

export const PUT = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;

  // A full replace: never fall back to an empty payload, that would wipe the whole role.
  let body: UpdateRoleFieldAccessRequest;
  try {
    body = await req.json();
  } catch {
    throw new BadRequestError("Invalid role field access payload.");
  }

  if (!body || !Array.isArray(body.fields)) {
    throw new BadRequestError("Invalid role field access payload.");
  }

  const { accessToken } = await hrisApiRolesService.updateRoleFieldAccess(id, body);

  // Saving rotates accessHash/perm_hash, invalidating the acting user's current token.
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
