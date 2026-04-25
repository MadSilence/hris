import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  useInvalidateDocumentsContentQuery,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/document/useDocumentsContent";
import {
  unstarPersonalDocumentAction,
  UnstarPersonalDocumentActionInput,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/actions/document/unstarPersonalDocumentAction";

export const useUnstarPersonalDocument = () => {
  const invalidateDocuments = useInvalidateDocumentsContentQuery();

  return useMutation({
    mutationFn: async (payload: UnstarPersonalDocumentActionInput) => {
      const result = await unstarPersonalDocumentAction(payload);

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
