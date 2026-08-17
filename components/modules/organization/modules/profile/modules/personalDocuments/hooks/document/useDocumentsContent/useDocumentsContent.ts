import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { DocumentFolderContentDTO } from "@/api/modules/documents/dto";
import {
  assertDocumentsUserId,
  getPersonalDocumentsQueryKey,
  PERSONAL_DOCUMENTS_QUERY_KEY
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/utils";
import {
  documentFolderService
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/services/documentFolderService";

type UseDocumentsContentArgs = {
  userId: string;
  folderId: string | null;
};

const getDocumentsContent = async ({
  userId,
  folderId,
}: UseDocumentsContentArgs): Promise<DocumentFolderContentDTO> => {
  assertDocumentsUserId(userId);

  if (!folderId) {
    return documentFolderService.getRootDocuments(userId);
  }

  return documentFolderService.getFolderContent(userId, folderId);
};

export const useDocumentsContent = ({
  userId,
  folderId,
}: UseDocumentsContentArgs) => {
  return useQuery<DocumentFolderContentDTO>({
    queryKey: getPersonalDocumentsQueryKey(userId, folderId),
    queryFn: () => getDocumentsContent({ userId, folderId }),
    enabled: Boolean(userId && userId !== "undefined"),
  });
};

/**
 * Invalidates one person's document tree, or every cached tree when no user is given.
 * The key is `[PERSONAL_DOCUMENTS_QUERY_KEY, userId, folderId]`, so passing the user narrows it to
 * that person's folders instead of refetching everyone's.
 */
export const useInvalidateDocumentsContentQuery = () => {
  const queryClient = useQueryClient();

  return (userId?: string) => {
    void queryClient.invalidateQueries({
      queryKey: userId
        ? [PERSONAL_DOCUMENTS_QUERY_KEY, userId]
        : [PERSONAL_DOCUMENTS_QUERY_KEY],
    });
  };
};
