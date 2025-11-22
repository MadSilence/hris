import { useMutation } from "@tanstack/react-query";
import {
  reorderAttributeGroupAction,
  ReorderAttributeGroupActionInput
} from "../../../actions/AttributeGroup/reorderAttributeGroupAction";

export const useReorderAttributeGroupAction = () => {
  return useMutation({
    mutationFn: (payload: ReorderAttributeGroupActionInput[]) => reorderAttributeGroupAction(payload),
  });
};
