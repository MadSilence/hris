import { useMutation } from "@tanstack/react-query";
import { useInvalidateAttributeGroupsQuery } from "@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  duplicateAttributeAction,
  DuplicateAttributeActionInput,
  DuplicateAttributeActionOutput,
} from "@/components/modules/settings/modules/attributes/actions/Attribute/duplicateAttributeAction";

export const useDuplicateAttributeAction = () => {
  // The settings list is driven by the groups query — the copy lands in its source's section.
  const revalidateAttributeGroupsQuery = useInvalidateAttributeGroupsQuery();

  return useMutation({
    mutationFn: (payload: DuplicateAttributeActionInput) => duplicateAttributeAction(payload),
    onSuccess: (result: DuplicateAttributeActionOutput) => {
      if (result.status === ActionStatus.SUCCESS) revalidateAttributeGroupsQuery();
    },
  });
};
