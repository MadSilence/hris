import { useMutation } from "@tanstack/react-query";
import {
  deletePersonalDocumentAction,
  DeletePersonalDocumentActionInput
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/actions/document/deletePersonalDocumentAction";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  useInvalidateDocumentsContentQuery
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/document/useDocumentsContent";

export const useDeletePersonalDocument = () => {
  const invalidateDocuments = useInvalidateDocumentsContentQuery();

  return useMutation({
    mutationFn: async (payload: DeletePersonalDocumentActionInput) => {
      const result = await deletePersonalDocumentAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to unstar document");
      }

      return result;
    },
    onSuccess: () => {
      invalidateDocuments();
    },
  });
};
