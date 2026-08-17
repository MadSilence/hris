import { hrisApiDocumentsClient } from "@/api/modules/documents/clients/hrisApiDocumentsClient";
import {
  CreateDocumentFolderRequest,
  DocumentDTO,
  DocumentFolderContentDTO,
  DocumentCategoryDTO,
  DocumentFolderDTO,
  MoveDocumentRequest,
  RenameDocumentFolderRequest,
  RenameDocumentRequest,
  SaveDocumentCategoryRequest,
  UploadDocumentArgs,
} from "@/api/modules/documents/dto";
import type { CreateResponse, UpdateResponse } from "@/api/models/misc";

export class HrisDocumentsService {
  public async getRootDocuments(userId: string): Promise<DocumentFolderContentDTO> {
    return hrisApiDocumentsClient.getRootDocuments(userId);
  }

  public async getFolderContent(
    userId: string,
    folderId: string
  ): Promise<DocumentFolderContentDTO> {
    return hrisApiDocumentsClient.getFolderContent(userId, folderId);
  }

  public async createFolder(
    userId: string,
    body: CreateDocumentFolderRequest
  ): Promise<CreateResponse> {
    return hrisApiDocumentsClient.createFolder(userId, body);
  }

  public async renameFolder(
    userId: string,
    folderId: string,
    body: RenameDocumentFolderRequest
  ): Promise<UpdateResponse> {
    return hrisApiDocumentsClient.renameFolder(userId, folderId, body);
  }

  public async deleteFolder(userId: string, folderId: string): Promise<void> {
    return hrisApiDocumentsClient.deleteFolder(userId, folderId);
  }

  public async starDocument(documentId: string): Promise<void> {
    return hrisApiDocumentsClient.starDocument(documentId);
  }

  public async unstarDocument(documentId: string): Promise<void> {
    return hrisApiDocumentsClient.unstarDocument(documentId);
  }

  public async deleteDocument(documentId: string): Promise<void> {
    return hrisApiDocumentsClient.deleteDocument(documentId);
  }

  public async moveDocument(
    documentId: string,
    body: MoveDocumentRequest
  ): Promise<void> {
    return hrisApiDocumentsClient.moveDocument(documentId, body);
  }

  public async renameDocument(
    documentId: string,
    body: RenameDocumentRequest
  ): Promise<void> {
    return hrisApiDocumentsClient.renameDocument(documentId, body);
  }

  public async listTrash(userId: string): Promise<DocumentDTO[]> {
    return hrisApiDocumentsClient.listTrash(userId);
  }

  public async restoreDocument(documentId: string): Promise<void> {
    return hrisApiDocumentsClient.restoreDocument(documentId);
  }

  public async purgeDocument(documentId: string): Promise<void> {
    return hrisApiDocumentsClient.purgeDocument(documentId);
  }

  public async getCategories(): Promise<DocumentCategoryDTO[]> {
    return hrisApiDocumentsClient.getCategories();
  }

  public async createCategory(body: SaveDocumentCategoryRequest): Promise<CreateResponse> {
    return hrisApiDocumentsClient.createCategory(body);
  }

  public async updateCategory(
    id: string,
    body: SaveDocumentCategoryRequest
  ): Promise<UpdateResponse> {
    return hrisApiDocumentsClient.updateCategory(id, body);
  }

  public async deleteCategory(id: string): Promise<void> {
    return hrisApiDocumentsClient.deleteCategory(id);
  }

  public async downloadDocument(documentId: string): Promise<Response> {
    return hrisApiDocumentsClient.downloadDocument(documentId);
  }

  public async uploadDocument(
    userId: string,
    payload: UploadDocumentArgs
  ): Promise<DocumentDTO> {
    return hrisApiDocumentsClient.uploadDocument(userId, payload);
  }
}

export const hrisDocumentsService = new HrisDocumentsService();
