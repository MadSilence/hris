import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiHubService } from "@/api/modules/hub/services";
import { BadRequestError } from "@/components/clients/exceptions";
import type { AudienceResolveRequest } from "@/models/hub";

/** CM07's count, avatars and "See who": a read, sent as a POST because an audience does not fit a query string. */
export const POST = apiRequestWrapper(async (req: Request) => {
  let body: Partial<AudienceResolveRequest>;
  try {
    body = await req.json();
  } catch {
    throw new BadRequestError("Invalid audience payload.");
  }
  const audience = body?.audience;
  if (!audience || !Array.isArray(audience.filters) || !Array.isArray(audience.userIds) || !Array.isArray(audience.roleIds)) {
    throw new BadRequestError("Invalid audience payload.");
  }
  return NextResponse.json(
    await hrisApiHubService.resolveAudience({
      audience: { mode: audience.mode, filters: audience.filters, userIds: audience.userIds, roleIds: audience.roleIds },
      q: typeof body.q === "string" && body.q.trim() ? body.q.trim() : null,
      limit: typeof body.limit === "number" ? body.limit : null,
    }),
  );
});
