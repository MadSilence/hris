import { useMutation } from "@tanstack/react-query";
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
    mutationFn: (payload: UploadPersonalDocumentActionInput) =>
      uploadPersonalDocumentAction(payload),
    onSuccess: () => {
      invalidateDocuments();
    },
  });
};
