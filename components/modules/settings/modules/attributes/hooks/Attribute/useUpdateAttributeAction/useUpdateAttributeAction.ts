import { useInvalidateAttributesQuery } from "@/components/modules/settings/modules/attributes/hooks/Attribute/useAttributes";
import { useMutation } from "@tanstack/react-query";
import {
  updateAttributeAction,
  UpdateAttributeActionInput
} from "@/components/modules/settings/modules/attributes/actions/Attribute/updateAttributeAction";

export const useUpdateAttributeAction = () => {
  const revalidateAttributesQuery = useInvalidateAttributesQuery();

  return useMutation({
    mutationFn: (payload: UpdateAttributeActionInput) => updateAttributeAction(payload),
    onSuccess: () => {
      revalidateAttributesQuery();
    },
  });
};
