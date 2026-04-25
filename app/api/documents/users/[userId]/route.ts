import { documentsRoutes } from "@/api/modules/documents/routes/documentsRoutes";

export async function GET(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;
  return documentsRoutes.getRootDocuments(req, userId);
}
