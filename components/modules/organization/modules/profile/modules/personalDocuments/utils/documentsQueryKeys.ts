export const PERSONAL_DOCUMENTS_QUERY_KEY = "PERSONAL_DOCUMENTS_QUERY_KEY";

export const getPersonalDocumentsQueryKey = (
  userId: string,
  folderId: string | null
) => [PERSONAL_DOCUMENTS_QUERY_KEY, userId, folderId ?? "root"];
