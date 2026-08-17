import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  useInvalidateDocumentsContentQuery
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/document/useDocumentsContent";
import {
  createDocumentsFolderAction,
  CreateDocumentsFolderActionInput
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/actions/documentsFolder/createDocumentsFolderAction";

export const useCreateDocumentsFolder = () => {
  const invalidateDocuments = useInvalidateDocumentsContentQuery();

  return useMutation({
    mutationFn: async (payload: CreateDocumentsFolderActionInput) => {
      const result = await createDocumentsFolderAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to create folder");
      }

      return result;
    },
    onSuccess: (_data, variables) => {
      invalidateDocuments(variables.userId);
    },
  });
};
