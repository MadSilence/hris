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
  categoryId: string | null;
  categoryName: string | null;
  /** HR_ONLY — the employee does not see it; VISIBLE_TO_EMPLOYEE — they can read it. */
  visibility: DocumentVisibility;
};

export type DocumentVisibility = "HR_ONLY" | "VISIBLE_TO_EMPLOYEE";

export type DocumentCategoryDTO = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  isSystem: boolean;
};

export type SaveDocumentCategoryRequest = {
  name: string;
  description?: string | null;
  isActive?: boolean;
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
  /** Omitted → the backend picks by who uploads (own space → visible, HR → HR-only). */
  visibility?: DocumentVisibility | null;
};

export type RenameDocumentRequest = {
  name: string;
};

export type MoveDocumentRequest = {
  /** Owner of the document — the backend rejects a folder belonging to anyone else. */
  targetUserId: string;
  /** `null` moves the document out of any folder, to the root. */
  folderId: string | null;
};

