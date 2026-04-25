import { documentsRoutes } from "@/api/modules/documents/routes/documentsRoutes";

export async function GET(
  req: Request,
  context: { params: Promise<{ userId: string; folderId: string }> }
) {
  console.log("We got here")
  const { userId, folderId } = await context.params;
  return documentsRoutes.getFolderContent(req, userId, folderId);
}
