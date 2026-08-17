import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  useInvalidateDocumentsContentQuery
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/document/useDocumentsContent";
import {
  uploadPersonalDocumentAction,
  UploadPersonalDocumentActionInput
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/actions/document/uploadPersonalDocumentAction";

export const useUploadPersonalDocument = () => {
  const invalidateDocuments = useInvalidateDocumentsContentQuery();

  return useMutation({
    mutationFn: async (payload: UploadPersonalDocumentActionInput) => {
      const result = await uploadPersonalDocumentAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to upload document");
      }

      return result;
    },
    onSuccess: (_data, variables) => {
      invalidateDocuments(variables.userId);
    },
  });
};
