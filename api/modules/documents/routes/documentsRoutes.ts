import { hrisDocumentsService } from "@/api/modules/documents/services/hrisDocumentsService";

export class DocumentsRoutes {
  public async getRootDocuments(_req: Request, userId: string) {
    const data = await hrisDocumentsService.getRootDocuments(userId);
    return Response.json(data);
  }

  public async getFolderContent(_req: Request, userId: string, folderId: string) {
    const data = await hrisDocumentsService.getFolderContent(userId, folderId);
    return Response.json(data);
  }

  public async createFolder(req: Request, userId: string) {
    const body = await req.json().catch(() => ({}));
    const data = await hrisDocumentsService.createFolder(userId, {
      name: body.name,
      parentId: body.parentId ?? null,
    });
    return Response.json(data);
  }

  public async renameFolder(req: Request, userId: string, folderId: string) {
    const body = await req.json().catch(() => ({}));
    const data = await hrisDocumentsService.renameFolder(userId, folderId, {
      name: body.name,
    });
    return Response.json(data);
  }

  public async deleteFolder(_req: Request, userId: string, folderId: string) {
    await hrisDocumentsService.deleteFolder(userId, folderId);
    return new Response(null, { status: 204 });
  }

  public async starDocument(_req: Request, documentId: string) {
    await hrisDocumentsService.starDocument(documentId);
    return new Response(null, { status: 204 });
  }

  public async unstarDocument(_req: Request, documentId: string) {
    await hrisDocumentsService.unstarDocument(documentId);
    return new Response(null, { status: 204 });
  }

  public async deleteDocument(_req: Request, documentId: string) {
    await hrisDocumentsService.deleteDocument(documentId);
    return new Response(null, { status: 204 });
  }

  public async downloadDocument(_req: Request, documentId: string) {
    const backendResponse = await hrisDocumentsService.downloadDocument(documentId);

    const contentType = backendResponse.headers.get("content-type") ?? "application/octet-stream";
    const contentDisposition =
      backendResponse.headers.get("content-disposition") ?? 'attachment';

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
      },
    });
  }
}

export const documentsRoutes = new DocumentsRoutes();
