import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisDocumentsService } from "@/api/modules/documents/services/hrisDocumentsService";

type RouteContext = { params: Promise<{ userId: string }> };

export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { userId } = await context.params;
  const documents = await hrisDocumentsService.listTrash(userId);

  return NextResponse.json(documents);
});
