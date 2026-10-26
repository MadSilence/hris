import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiPeopleViewsService } from "@/api/modules/peopleViews/services/hrisApiPeopleViewsService";
import type { SharePreviewGrantee } from "@/api/modules/peopleViews/clients/hrisApiPeopleViewsClient";
import { BadRequestError } from "@/components/clients/exceptions";

/**
 * A read, although it is a POST: who of the people these grantees reach will not see which of the
 * view's fields. Nothing is shared by asking.
 */
export const POST = apiRequestWrapper(async (
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  let body: { grantees?: SharePreviewGrantee[] };
  try {
    body = await req.json();
  } catch {
    throw new BadRequestError("Invalid share preview payload.");
  }
  if (!Array.isArray(body?.grantees)) {
    throw new BadRequestError("Invalid share preview payload.");
  }
  const preview = await hrisApiPeopleViewsService.previewShare(id, body.grantees);
  return NextResponse.json(preview);
});
