import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisRoleAssignmentsService } from "@/api/modules/roles/services/hrisRoleAssignmentsService/hrisRoleAssignmentsService";
import { BadRequestError } from "@/api/models/errors/BadRequestError";
import { RoleSegmentApplyRequest } from "@/api/modules/roles/dto/RoleSegmentAssignmentDTO";

type RouteContext = { params: Promise<{ id: string }> };

export const POST = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;

  let body: RoleSegmentApplyRequest;
  try {
    body = await req.json();
  } catch {
    throw new BadRequestError("Invalid segment payload.");
  }

  const segment = body?.segment;
  if (!segment || !Array.isArray(segment.filters) || !Array.isArray(segment.excludeUserIds)) {
    throw new BadRequestError("Invalid segment payload.");
  }

  const data = await hrisRoleAssignmentsService.segmentApply(id, body);

  return NextResponse.json(data, { status: 202 });
});
