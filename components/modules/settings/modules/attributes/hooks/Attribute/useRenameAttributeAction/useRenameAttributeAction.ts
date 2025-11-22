import { useInvalidateAttributesQuery } from "@/components/modules/settings/modules/attributes/hooks/Attribute/useAttributes";
import { useMutation } from "@tanstack/react-query";
import {
  renameAttributeAction,
  RenameAttributeActionInput
} from "@/components/modules/settings/modules/attributes/actions/Attribute/renameAttributeAction";

export const useRenameAttributeAction = () => {
  const revalidateAttributesQuery = useInvalidateAttributesQuery();

  return useMutation({
    mutationFn: (payload: RenameAttributeActionInput) => renameAttributeAction(payload),
    onSuccess: () => {
      revalidateAttributesQuery();
    },
  });
};
