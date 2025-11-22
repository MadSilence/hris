import { useMutation } from "@tanstack/react-query";
import { useInvalidateAttributesQuery } from "@/components/modules/settings/modules/attributes/hooks/Attribute/useAttributes";
import {
  createAttributeAction,
  CreateAttributeActionInput
} from "@/components/modules/settings/modules/attributes/actions/Attribute/createAttributeAction";

export const useCreateAttributeAction = () => {
  const revalidateAttributesQuery = useInvalidateAttributesQuery();

  return useMutation({
    mutationFn: (payload: CreateAttributeActionInput) => createAttributeAction(payload),
    onSuccess: () => {
      revalidateAttributesQuery();
    }
  });
};
