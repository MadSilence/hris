import { useMutation } from "@tanstack/react-query";
import type { UpdateOfficeActionInput } from "@/components/modules/settings/modules/office/actions/updateOfficeAction";
import { updateOfficeAction } from "@/components/modules/settings/modules/office/actions/updateOfficeAction";
import { useInvalidateOfficeQuery } from "@/components/modules/settings/modules/office/hooks/useOffice";

export const useUpdateOfficeAction = () => {
  const invalidate = useInvalidateOfficeQuery();

  return useMutation({
    mutationFn: (payload: UpdateOfficeActionInput) =>
      updateOfficeAction(payload),
    onSuccess: () => {
      invalidate();
    },
  });
};
