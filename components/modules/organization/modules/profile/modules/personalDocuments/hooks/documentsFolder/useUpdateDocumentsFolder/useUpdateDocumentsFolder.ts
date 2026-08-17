import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
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
    mutationFn: async (payload: UpdateDocumentsFolderActionInput) => {
      const result = await updateDocumentsFolderAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to rename folder");
      }

      return result;
    },
    onSuccess: (_data, variables) => {
      invalidateDocuments(variables.userId);
    },
  });
};
