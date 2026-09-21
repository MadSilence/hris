import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  deleteUserAvatarAction,
  DeleteUserAvatarActionInput,
} from "@/components/modules/organization/modules/profile/actions/deleteUserAvatarAction";

export const useDeleteUserAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    /*
     * The action *returns* its failure rather than throwing it, so a removal that did not happen
     * counted as a success: `onSuccess` invalidated every query, the caller went on to refresh the
     * person, and the profile — not the dialog — showed the error. With the backend down the whole
     * page was replaced by "Something went wrong" and the dialog carrying the real message was
     * unmounted with it. Rethrow, so the caller's own catch can say what failed, where it happened.
     */
    mutationFn: async (payload: DeleteUserAvatarActionInput) => {
      const result = await deleteUserAvatarAction(payload);
      if (result.status !== ActionStatus.SUCCESS) {
        throw new Error(result.errorMessage ?? "The photo could not be removed.");
      }
      return result;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries();
    },
  });
};
