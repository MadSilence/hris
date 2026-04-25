import type { DocumentDTO } from "@/api/modules/documents/dto";

export type UploadPersonalDocumentRequest = {
  userId: string;
  file: File;
  folderId?: string | null;
  categoryId?: string | null;
};

export type DeletePersonalDocumentRequest = {
  documentId: string;
};

export type StarPersonalDocumentRequest = {
  documentId: string;
};

export type UnstarPersonalDocumentRequest = {
  documentId: string;
};

export class DocumentService {
  public async uploadPersonalDocument(
    payload: UploadPersonalDocumentRequest
  ): Promise<DocumentDTO> {
    const formData = new FormData();
    formData.append("file", payload.file);

    if (payload.folderId) {
      formData.append("folderId", payload.folderId);
    }

    if (payload.categoryId) {
      formData.append("categoryId", payload.categoryId);
    }

    const res = await fetch(`/api/documents/users/${payload.userId}/upload`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Failed to upload document");
    }

    return res.json();
  }

  public async deletePersonalDocument(
    payload: DeletePersonalDocumentRequest
  ): Promise<void> {
    const res = await fetch(`/api/documents/${payload.documentId}/delete`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Failed to delete document");
    }
  }

  public async starPersonalDocument(
    payload: StarPersonalDocumentRequest
  ): Promise<void> {
    const res = await fetch(`/api/documents/${payload.documentId}/star`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Failed to star document");
    }
  }

  public async unstarPersonalDocument(
    payload: UnstarPersonalDocumentRequest
  ): Promise<void> {
    const res = await fetch(`/api/documents/${payload.documentId}/star`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Failed to unstar document");
    }
  }

  public getPersonalDocumentDownloadUrl(documentId: string): string {
    return `/api/documents/${documentId}/download`;
  }
}

export const documentService = new DocumentService();
