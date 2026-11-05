import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";

export type DocumentBatchOperation = "delete" | "restore" | "purge" | "star" | "move";
import {
  CreateDocumentFolderRequest,
  DocumentDTO,
  DocumentVisibility,
  DocumentFolderDeleteImpactDTO,
  DocumentFolderDeleteStrategy,
  DocumentFolderContentDTO,
  DocumentCategoryDTO,
  MoveDocumentRequest,
  RenameDocumentFolderRequest,
  RenameDocumentRequest,
  SaveDocumentCategoryRequest,
  UpdateDocumentCategoryRequest,
  UploadDocumentArgs,
} from "@/api/modules/documents/dto";
import { documentMapper } from "@/api/modules/documents/mappers/documentMapper";
import type { CreateResponse, UpdateResponse } from "@/api/models/misc";

export class HrisApiDocumentsClient {
  private readonly BASE_PATH = "/documents";

  public async getRootDocuments(userId: string): Promise<DocumentFolderContentDTO> {
    const dto = await hrisApiClient.get<DocumentFolderContentDTO>(
      `${this.BASE_PATH}/users/${userId}`
    );
    return documentMapper.mapFolderContentDTO(dto);
  }

  public async getFolderContent(
    userId: string,
    folderId: string
  ): Promise<DocumentFolderContentDTO> {
    const dto = await hrisApiClient.get<DocumentFolderContentDTO>(
      `${this.BASE_PATH}/users/${userId}/folders/${folderId}/content`
    );
    return documentMapper.mapFolderContentDTO(dto);
  }

  public async createFolder(
    userId: string,
    body: CreateDocumentFolderRequest
  ): Promise<CreateResponse> {
    return hrisApiClient.post<CreateResponse>(
      `${this.BASE_PATH}/users/${userId}/folders/create`,
      body
    );
  }

  public async renameFolder(
    userId: string,
    folderId: string,
    body: RenameDocumentFolderRequest
  ): Promise<UpdateResponse> {
    return hrisApiClient.patch<UpdateResponse, RenameDocumentFolderRequest>(
      `${this.BASE_PATH}/users/${userId}/folders/${folderId}`,
      body
    );
  }

  public async getFolderDeleteImpact(
    userId: string,
    folderId: string
  ): Promise<DocumentFolderDeleteImpactDTO> {
    return hrisApiClient.get<DocumentFolderDeleteImpactDTO>(
      `${this.BASE_PATH}/users/${userId}/folders/${folderId}/delete-impact`
    );
  }

  public async deleteFolder(
    userId: string,
    folderId: string,
    strategy: DocumentFolderDeleteStrategy
  ): Promise<void> {
    await hrisApiClient.post<void>(
      `${this.BASE_PATH}/users/${userId}/folders/${folderId}/delete`,
      { strategy }
    );
  }

  public async starDocument(documentId: string): Promise<void> {
    await hrisApiClient.post<void>(`${this.BASE_PATH}/${documentId}/star`);
  }

  public async unstarDocument(documentId: string): Promise<void> {
    await hrisApiClient.delete<void>(`${this.BASE_PATH}/${documentId}/star`);
  }

  public async deleteDocument(documentId: string): Promise<void> {
    await hrisApiClient.post<void>(`${this.BASE_PATH}/${documentId}/delete`);
  }

  public async moveDocument(
    documentId: string,
    body: MoveDocumentRequest
  ): Promise<void> {
    await hrisApiClient.post<void>(`${this.BASE_PATH}/${documentId}/move`, body);
  }

  public async renameDocument(
    documentId: string,
    body: RenameDocumentRequest
  ): Promise<void> {
    await hrisApiClient.post<void>(`${this.BASE_PATH}/${documentId}/rename`, body);
  }

  /** HR only, or the person too — after upload (D3). */
  public async changeVisibility(documentId: string, visibility: DocumentVisibility): Promise<void> {
    await hrisApiClient.post<void>(`${this.BASE_PATH}/${documentId}/visibility`, { visibility });
  }

  public async listTrash(userId: string): Promise<DocumentDTO[]> {
    return hrisApiClient.get<DocumentDTO[]>(`${this.BASE_PATH}/users/${userId}/trash`);
  }

  public async restoreDocument(documentId: string): Promise<void> {
    await hrisApiClient.post<void>(`${this.BASE_PATH}/${documentId}/restore`);
  }

  public async purgeDocument(documentId: string): Promise<void> {
    await hrisApiClient.post<void>(`${this.BASE_PATH}/${documentId}/purge`);
  }

  public async getCategories(): Promise<DocumentCategoryDTO[]> {
    return hrisApiClient.get<DocumentCategoryDTO[]>(`${this.BASE_PATH}/categories`);
  }

  public async createCategory(body: SaveDocumentCategoryRequest): Promise<CreateResponse> {
    return hrisApiClient.post<CreateResponse>(`${this.BASE_PATH}/categories/create`, body);
  }

  public async updateCategory(
    id: string,
    body: UpdateDocumentCategoryRequest
  ): Promise<UpdateResponse> {
    return hrisApiClient.patch<UpdateResponse, UpdateDocumentCategoryRequest>(
      `${this.BASE_PATH}/categories/${id}`,
      body
    );
  }

  public async deleteCategory(id: string): Promise<void> {
    await hrisApiClient.post<void>(`${this.BASE_PATH}/categories/${id}/delete`);
  }

  /** Several documents at once (D2): each checked and journalled as one, all or none. */
  public async batch(
    operation: DocumentBatchOperation,
    body: { ids: string[]; folderId?: string | null; targetUserId?: string; starred?: boolean },
  ): Promise<void> {
    await hrisApiClient.post<void>(`${this.BASE_PATH}/batch/${operation}`, body);
  }

  /** The selection as one zip — raw, so the route can stream it on. */
  public async downloadZip(ids: string[]): Promise<Response> {
    const qs = new URLSearchParams();
    for (const id of ids) qs.append("ids", id);
    return hrisApiClient.fetch(`${this.BASE_PATH}/batch/zip?${qs.toString()}`);
  }

  public async downloadDocument(documentId: string): Promise<Response> {
    return hrisApiClient.fetch(`${this.BASE_PATH}/${documentId}/download`);
  }

  public async uploadDocument(
    userId: string,
    payload: UploadDocumentArgs
  ): Promise<DocumentDTO> {
    const formData = new FormData();

    formData.append("file", payload.file);

    if (payload.folderId) {
      formData.append("folderId", payload.folderId);
    }

    if (payload.categoryId) {
      formData.append("categoryId", payload.categoryId);
    }

    if (payload.visibility) {
      formData.append("visibility", payload.visibility);
    }

    return hrisApiClient.postForm<DocumentDTO>(
      `${this.BASE_PATH}/users/${userId}/upload`,
      formData
    );
  }
}

export const hrisApiDocumentsClient = new HrisApiDocumentsClient();
