import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  useInvalidateDocumentsContentQuery,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/document/useDocumentsContent";
import {
  starPersonalDocumentAction,
  StarPersonalDocumentActionInput,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/actions/document/starPersonalDocumentAction";

export const useStarPersonalDocument = () => {
  const invalidateDocuments = useInvalidateDocumentsContentQuery();

  return useMutation({
    mutationFn: async (payload: StarPersonalDocumentActionInput) => {
      const result = await starPersonalDocumentAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to star document");
      }

      return result;
    },
    onSuccess: () => {
      invalidateDocuments();
    },
  });
};
