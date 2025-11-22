import { useInvalidateAttributeGroupsQuery } from "@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups";
import { useMutation } from "@tanstack/react-query";
import {
  renameAttributeGroupAction,
  RenameAttributeGroupActionInput
} from "../../../actions/AttributeGroup/renameAttributeGroupAction";

export const useRenameAttributeGroupAction = () => {
  const revalidateAttributeGroupsQuery = useInvalidateAttributeGroupsQuery();

  return useMutation({
    mutationFn: (payload: RenameAttributeGroupActionInput) => renameAttributeGroupAction(payload),
    onSuccess: () => {
      revalidateAttributeGroupsQuery();
    },
  });
};
