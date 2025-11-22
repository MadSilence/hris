import { useMutation } from "@tanstack/react-query";
import { useInvalidateAttributesQuery } from "@/components/modules/settings/modules/attributes/hooks/Attribute/useAttributes";
import {
  deleteAttributeAction,
  DeleteAttributeActionInput
} from "@/components/modules/settings/modules/attributes/actions/Attribute/deleteAttributeAction";

export const useDeleteAttributeAction = () => {
  const revalidateAttributesQuery = useInvalidateAttributesQuery();

  return useMutation({
    mutationFn: (payload: DeleteAttributeActionInput) => deleteAttributeAction(payload),
    onSuccess: () => {
      revalidateAttributesQuery();
    },
  });
};
