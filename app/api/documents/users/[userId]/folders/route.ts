import { documentsRoutes } from "@/api/modules/documents/routes/documentsRoutes";

export async function POST(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;
  return documentsRoutes.createFolder(req, userId);
}

