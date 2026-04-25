import { useMutation } from "@tanstack/react-query";
import {
  useInvalidateDocumentsContentQuery
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/document/useDocumentsContent";
import {
  deleteDocumentsFolderAction,
  DeleteDocumentsFolderActionInput
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/actions/documentsFolder/deleteDocumentsFolderAction";

export const useDeleteDocumentsFolder = () => {
  const invalidateDocuments = useInvalidateDocumentsContentQuery();

  return useMutation({
    mutationFn: (payload: DeleteDocumentsFolderActionInput) =>
      deleteDocumentsFolderAction(payload),
    onSuccess: (_data, variables) => {
      invalidateDocuments(variables.userId);
    },
  });
};
