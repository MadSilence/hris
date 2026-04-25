export type DocumentFolderDTO = {
  id: string;
  name: string;
  parentId: string | null;
  userId: string;
  createdAt: string;
};

export type DocumentDTO = {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  userId: string;
  uploadedBy: string;
  createdAt: string;
  folderId: string | null;
  isStarred: boolean;
};

export type DocumentFolderContentDTO = {
  folderId: string | null;
  parentId: string | null;
  folders: DocumentFolderDTO[];
  documents: DocumentDTO[];
};

export type CreateDocumentFolderRequest = {
  name: string;
  parentId: string | null;
};

export type RenameDocumentFolderRequest = {
  name: string;
};

export type UploadDocumentArgs = {
  file: File;
  folderId?: string | null;
  categoryId?: string | null;
};

