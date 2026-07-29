import { internalApiClient } from "@/components/clients/apiClient";
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
    return internalApiClient.get<DocumentFolderContentDTO>(
      `/documents/users/${userId}/folders/${folderId}/content`,
    );
  }

  public async getRootDocuments(userId: string): Promise<DocumentFolderContentDTO> {
    return internalApiClient.get<DocumentFolderContentDTO>(
      `/documents/users/${userId}/folders/root`,
    );
  }
}

export const documentFolderService = new DocumentFolderService();
