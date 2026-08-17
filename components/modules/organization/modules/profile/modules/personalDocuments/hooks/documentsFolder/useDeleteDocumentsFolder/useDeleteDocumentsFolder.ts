import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
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
    mutationFn: async (payload: DeleteDocumentsFolderActionInput) => {
      const result = await deleteDocumentsFolderAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to delete folder");
      }

      return result;
    },
    onSuccess: (_data, variables) => {
      invalidateDocuments(variables.userId);
    },
  });
};
