import { useMutation } from "@tanstack/react-query";
import { useInvalidateAttributeGroupsQuery } from "@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups";
import {
  deleteAttributeGroupAction,
  DeleteAttributeGroupActionInput
} from "../../../actions/AttributeGroup/deleteAttributeGroupAction";

export const useDeleteAttributeGroupAction = () => {
  const revalidateAttributeGroupsQuery = useInvalidateAttributeGroupsQuery();

  return useMutation({
    mutationFn: (payload: DeleteAttributeGroupActionInput) => deleteAttributeGroupAction(payload),
    onSuccess: () => {
      revalidateAttributeGroupsQuery();
    },
  });
};
