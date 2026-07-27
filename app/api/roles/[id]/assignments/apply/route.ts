import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisRoleAssignmentsService } from "@/api/modules/roles/services/hrisRoleAssignmentsService/hrisRoleAssignmentsService";
import { BadRequestError } from "@/api/models/errors/BadRequestError";
import { RoleAssignmentRequest } from "@/api/modules/roles/dto/RoleAssignmentDTO";

type RouteContext = { params: Promise<{ id: string }> };

export const POST = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;

  let body: RoleAssignmentRequest;
  try {
    body = await req.json();
  } catch {
    throw new BadRequestError("Invalid assignment payload.");
  }

  if (!body?.targetType) {
    throw new BadRequestError("Invalid assignment payload.");
  }

  const data = await hrisRoleAssignmentsService.apply(id, body);

  return NextResponse.json(data, { status: 201 });
});
