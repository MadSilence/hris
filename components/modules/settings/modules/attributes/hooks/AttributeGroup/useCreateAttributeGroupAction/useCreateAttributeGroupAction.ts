import { useMutation } from "@tanstack/react-query";
import { createAttributeGroupAction, CreateAttributeGroupActionInput } from "../../../actions/AttributeGroup/createGroupAction";
import { useInvalidateAttributeGroupsQuery } from "@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups";

export const useCreateAttributeGroupAction = () => {
  const revalidateAttributeGroupsQuery = useInvalidateAttributeGroupsQuery();

  return useMutation({
    mutationFn: (payload: CreateAttributeGroupActionInput) => createAttributeGroupAction(payload),
    onSuccess: () => {
      revalidateAttributeGroupsQuery();
    }
  });
};
