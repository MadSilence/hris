export * from "./DocumentFolderDeleteImpactDTO";
export type DocumentFolderDTO = {
  id: string;
  name: string;
  parentId: string | null;
  userId: string;
  createdAt: string;
  /** A Hugeicons key from the folder set; null draws the plain folder (documents-tab T03). */
  icon?: string | null;
  /** A tag-palette colour; null is gray. */
  color?: string | null;
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
  description?: string | null;
  /** The last day it is valid (ISO date); null when it does not expire. */
  expiresOn?: string | null;
  /** Null without a date. EXPIRING inside the category's reminder window (30 days without one). */
  expiryState?: DocumentExpiryState | null;
  /** NOT_SCANNED until a malware scanner is connected (DOCUMENTS_DESIGN.md D7). */
  scanStatus?: "NOT_SCANNED" | "CLEAN" | "INFECTED" | "FAILED";
  sourceTemplateId?: string | null;
  envelopeId?: string | null;
  /** Set on the sealed result of a signing; such a document is final. */
  signedAt?: string | null;
  /** When it went to the trash (T10's "Moved to trash"); null outside it. */
  deletedAt?: string | null;
};

export type DocumentExpiryState = "VALID" | "EXPIRING" | "EXPIRED";

export type DocumentVisibility = "HR_ONLY" | "VISIBLE_TO_EMPLOYEE";

export type DocumentCategoryDTO = {
  id: string;
  name: string;
  /**
   * False for a category deleted with "keep" (AQ-19): its documents keep the tag, nobody picks it for a new file, and
   * the settings list no longer shows it.
   */
  isActive: boolean;
  isSystem: boolean;
  /** Sent back by the edit dialog; the backend refuses a save over a newer row (E00409). */
  version?: number;
  /** A document of this category cannot be filed without an expiry date. */
  requiresExpiry?: boolean;
  /** Days before expiry the person and their HR are reminded; null is no reminder. */
  remindDaysBefore?: number | null;
  /** What an upload takes when it does not choose; null keeps the uploader's rule. */
  defaultVisibility?: DocumentVisibility | null;
};

export type SaveDocumentCategoryRequest = {
  name: string;
  requiresExpiry?: boolean;
  /** 0 clears the reminder. */
  remindDaysBefore?: number | null;
  /** An empty string clears the default. */
  defaultVisibility?: DocumentVisibility | "" | null;
};

/** Create has no version to send — the backend body is strict, so it is only on the update type. */
export type UpdateDocumentCategoryRequest = SaveDocumentCategoryRequest & {
  /** The version the dialog was opened with. */
  version?: number;
};

/** "{n} documents have this category" — what the delete dialog reads before it asks (AQ-19). */
export type DocumentCategoryDeleteImpactDTO = {
  name: string;
  /** Live documents of the category. */
  documents: number;
  /** Documents of it in the trash — a move re-tags them too (W10). */
  trashed: number;
};

/** KEEP retires the category and its documents keep the tag; MOVE moves them to `targetCategoryId` first. */
export type DeleteDocumentCategoryRequest = {
  strategy: "KEEP" | "MOVE";
  targetCategoryId?: string | null;
};

export type DocumentFolderContentDTO = {
  folderId: string | null;
  parentId: string | null;
  folders: DocumentFolderDTO[];
  documents: DocumentDTO[];
  /**
   * At the root with every document listed: each listed document's folder name by id, at any depth — All documents
   * heads its groups with it, where `folders` holds only the root's.
   */
  folderNames?: Record<string, string>;
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
  description?: string | null;
  /** ISO date. Required when the category requires expiry (D00029). */
  expiresOn?: string | null;
};

/** `PATCH /documents/{id}` — partial; `clearExpiresOn` removes the date. */
export type UpdateDocumentDetailsRequest = {
  description?: string | null;
  expiresOn?: string | null;
  clearExpiresOn?: boolean;
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

