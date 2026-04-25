import { hrisApiDocumentsClient } from "@/api/modules/documents/clients/hrisApiDocumentsClient";
import {
  CreateDocumentFolderRequest,
  DocumentDTO,
  DocumentFolderContentDTO,
  DocumentFolderDTO,
  RenameDocumentFolderRequest,
  UploadDocumentArgs,
} from "@/api/modules/documents/dto";

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
  ): Promise<DocumentFolderDTO> {
    console.log("we are here", body);
    return hrisApiDocumentsClient.createFolder(userId, body);
  }

  public async renameFolder(
    userId: string,
    folderId: string,
    body: RenameDocumentFolderRequest
  ): Promise<DocumentFolderDTO> {
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
