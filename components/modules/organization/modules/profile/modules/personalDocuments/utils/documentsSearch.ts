import type { DocumentDTO, DocumentFolderDTO } from "@/api/modules/documents/dto";

export const filterDocumentsFolders = (
  folders: DocumentFolderDTO[],
  search: string
): DocumentFolderDTO[] => {
  const q = search.trim().toLowerCase();
  if (!q) return folders;

  return folders.filter((folder) => folder.name.toLowerCase().includes(q));
};

export const filterDocumentsFiles = (
  documents: DocumentDTO[],
  search: string
): DocumentDTO[] => {
  const q = search.trim().toLowerCase();
  if (!q) return documents;

  return documents.filter((doc) =>
    [doc.name, doc.mimeType].some((value) => value.toLowerCase().includes(q))
  );
};
