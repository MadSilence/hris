import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisSegmentsService } from "@/api/modules/segments/services/hrisSegmentsService/hrisSegmentsService";
import { BadRequestError } from "@/api/models/errors/BadRequestError";
import { Segment } from "@/models/segment/Segment";

type ResolveBody = {
  segment?: Segment;
  cursor?: string | null;
  limit?: number;
  q?: string | null;
  include?: string[] | null;
};

export const POST = apiRequestWrapper(async (req: Request) => {
  let body: ResolveBody;
  try {
    body = await req.json();
  } catch {
    throw new BadRequestError("Invalid segment payload.");
  }

  const segment = body?.segment;
  if (!segment || !Array.isArray(segment.filters) || !Array.isArray(segment.excludeUserIds)) {
    throw new BadRequestError("Invalid segment payload.");
  }

  const data = await hrisSegmentsService.resolve(segment, {
    cursor: body.cursor ?? null,
    limit: body.limit,
    q: body.q ?? null,
    include: body.include ?? null,
  });

  return NextResponse.json(data);
});
