import { useMutation } from "@tanstack/react-query";
import {
  reorderAttributesAction,
  ReorderAttributesActionInput
} from "@/components/modules/settings/modules/attributes/actions/Attribute/reorderAttributesAction";

export const useReorderAttributesAction = () => {
  return useMutation({
    mutationFn: (payload: ReorderAttributesActionInput[]) => reorderAttributesAction(payload),
  })
};
