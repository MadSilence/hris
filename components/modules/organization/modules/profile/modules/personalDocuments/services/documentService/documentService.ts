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

  /**
   * The bytes, through the client every other read goes through.
   *
   * The preview modal called `fetch(getDownloadUrl(id))` directly, so a session that had expired
   * while the folder was open produced "Failed to load (401)" instead of a renewal and a retry, and
   * a refusal read the same as a dead backend. Going through `InternalApiClient` costs nothing here
   * — the preview needs a blob either way — and buys the renewal, the typed exception and the
   * refusal card.
   */
  public async fetchPersonalDocument(documentId: string): Promise<Blob> {
    const response = await internalApiClient.fetch(`/documents/${documentId}/download`, {
      method: "GET",
    });
    return response.blob();
  }

  /**
   * The same file as a plain URL, for the `<a download>` fallback.
   *
   * That one stays a browser navigation on purpose: it is the escape hatch for when the in-page
   * preview cannot render the type, and a navigation carries the session cookie by itself. There is
   * nothing to gain by turning it into a blob the page then has to hold.
   */
  public getPersonalDocumentDownloadUrl(documentId: string): string {
    return `/api/documents/${documentId}/download`;
  }
}

export const documentService = new DocumentService();
