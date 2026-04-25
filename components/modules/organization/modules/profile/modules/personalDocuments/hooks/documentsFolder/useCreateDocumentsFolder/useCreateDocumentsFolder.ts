import { useMutation } from "@tanstack/react-query";
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
    mutationFn: (payload: CreateDocumentsFolderActionInput) =>
      createDocumentsFolderAction(payload),
    onSuccess: (_data, variables) => {
      invalidateDocuments(variables.userId);
    },
  });
};
