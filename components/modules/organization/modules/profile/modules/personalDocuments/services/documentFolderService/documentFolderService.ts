import type { DocumentFolderContentDTO } from "@/api/modules/documents/dto";

export type CreateDocumentsFolderRequest = {
  userId: string;
  name: string;
  parentId: string | null;
};

export type UpdateDocumentsFolderRequest = {
  userId: string;
  folderId: string;
  name: string;
};

export type DeleteDocumentsFolderRequest = {
  userId: string;
  folderId: string;
};

export class DocumentFolderService {
  public async getFolderContent(
    userId: string,
    folderId: string
  ): Promise<DocumentFolderContentDTO> {
    const res = await fetch(`/api/documents/users/${userId}/folders/${folderId}/content`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to load folder content");
    }

    return res.json();
  }

  public async getRootDocuments(userId: string): Promise<DocumentFolderContentDTO> {
    const res = await fetch(`/api/documents/users/${userId}/folders/root`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to load folder content");
    }

    return res.json();
  }
}

export const documentFolderService = new DocumentFolderService();
