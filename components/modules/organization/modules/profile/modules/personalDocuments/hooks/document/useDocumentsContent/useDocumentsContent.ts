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

export const useInvalidateDocumentsContentQuery = () => {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({
      queryKey: [PERSONAL_DOCUMENTS_QUERY_KEY],
    });
  };
};
