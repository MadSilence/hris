import { documentsRoutes } from "@/api/modules/documents/routes/documentsRoutes";

export async function POST(
  req: Request,
  context: { params: Promise<{ documentId: string }> }
) {
  const { documentId } = await context.params;
  return documentsRoutes.deleteDocument(req, documentId);
}
