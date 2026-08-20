import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import {
  CreateDocumentFolderRequest,
  DocumentDTO,
  DocumentFolderContentDTO,
  DocumentCategoryDTO,
  MoveDocumentRequest,
  RenameDocumentFolderRequest,
  RenameDocumentRequest,
  SaveDocumentCategoryRequest,
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

  public async deleteFolder(userId: string, folderId: string): Promise<void> {
    await hrisApiClient.post<void>(
      `${this.BASE_PATH}/users/${userId}/folders/${folderId}/delete`
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
    body: SaveDocumentCategoryRequest
  ): Promise<UpdateResponse> {
    return hrisApiClient.patch<UpdateResponse, SaveDocumentCategoryRequest>(
      `${this.BASE_PATH}/categories/${id}`,
      body
    );
  }

  public async deleteCategory(id: string): Promise<void> {
    await hrisApiClient.post<void>(`${this.BASE_PATH}/categories/${id}/delete`);
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
