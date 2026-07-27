import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisRoleAssignmentsService } from "@/api/modules/roles/services/hrisRoleAssignmentsService/hrisRoleAssignmentsService";
import { BadRequestError } from "@/api/models/errors/BadRequestError";
import { RoleSegmentPreviewRequest } from "@/api/modules/roles/dto/RoleSegmentAssignmentDTO";

type RouteContext = { params: Promise<{ id: string }> };

export const POST = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;

  let body: RoleSegmentPreviewRequest;
  try {
    body = await req.json();
  } catch {
    throw new BadRequestError("Invalid segment payload.");
  }

  const segment = body?.segment;
  if (!segment || !Array.isArray(segment.filters) || !Array.isArray(segment.excludeUserIds)) {
    throw new BadRequestError("Invalid segment payload.");
  }

  const data = await hrisRoleAssignmentsService.segmentPreview(id, body);

  return NextResponse.json(data);
});
