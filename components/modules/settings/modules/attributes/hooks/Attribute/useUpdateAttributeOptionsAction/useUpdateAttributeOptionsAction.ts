import { useMutation } from "@tanstack/react-query";
import { useInvalidateAttributesQuery } from "@/components/modules/settings/modules/attributes/hooks/Attribute/useAttributes";
import {
  updateAttributeOptionsAction,
  UpdateAttributeOptionsActionInput,
} from "@/components/modules/settings/modules/attributes/actions/Attribute/updateAttributeOptionsAction";

export const useUpdateAttributeOptionsAction = () => {
  const revalidateAttributesQuery = useInvalidateAttributesQuery();

  return useMutation({
    mutationFn: (payload: UpdateAttributeOptionsActionInput) =>
      updateAttributeOptionsAction(payload),
    onSuccess: () => {
      revalidateAttributesQuery();
    },
  });
};
