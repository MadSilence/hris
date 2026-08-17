import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  useInvalidateDocumentsContentQuery
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/document/useDocumentsContent";
import {
  moveDocumentAction,
  MoveDocumentActionInput
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/actions/document/moveDocumentAction";

export const useMoveDocument = () => {
  const invalidateDocuments = useInvalidateDocumentsContentQuery();

  return useMutation({
    mutationFn: async (payload: MoveDocumentActionInput) => {
      const result = await moveDocumentAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to move document");
      }

      return result;
    },
    onSuccess: (_data, variables) => {
      invalidateDocuments(variables.userId);
    },
  });
};
