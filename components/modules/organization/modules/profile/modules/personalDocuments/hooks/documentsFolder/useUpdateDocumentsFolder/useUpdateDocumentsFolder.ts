import { useMutation } from "@tanstack/react-query";
import {
  useInvalidateDocumentsContentQuery
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/document/useDocumentsContent";
import {
  updateDocumentsFolderAction,
  UpdateDocumentsFolderActionInput
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/actions/documentsFolder/updateDocumentsFolderAction";

export const useUpdateDocumentsFolder = () => {
  const invalidateDocuments = useInvalidateDocumentsContentQuery();

  return useMutation({
    mutationFn: (payload: UpdateDocumentsFolderActionInput) =>
      updateDocumentsFolderAction(payload),
    onSuccess: (_data, variables) => {
      invalidateDocuments(variables.userId);
    },
  });
};
