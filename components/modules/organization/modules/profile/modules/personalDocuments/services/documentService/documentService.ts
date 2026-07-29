import { internalApiClient } from "@/components/clients/apiClient";
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

    const res = await internalApiClient.fetch(`/documents/users/${payload.userId}/upload`, {
      method: "POST",
      body: formData,
    });

    return res.json();
  }

  public async deletePersonalDocument(
    payload: DeletePersonalDocumentRequest
  ): Promise<void> {
    await internalApiClient.post<void>(`/documents/${payload.documentId}/delete`);
  }

  public async starPersonalDocument(
    payload: StarPersonalDocumentRequest
  ): Promise<void> {
    await internalApiClient.post<void>(`/documents/${payload.documentId}/star`);
  }

  public async unstarPersonalDocument(
    payload: UnstarPersonalDocumentRequest
  ): Promise<void> {
    await internalApiClient.fetch(`/documents/${payload.documentId}/star`, {
      method: "DELETE",
    });
  }

  public getPersonalDocumentDownloadUrl(documentId: string): string {
    return `/api/documents/${documentId}/download`;
  }
}

export const documentService = new DocumentService();
