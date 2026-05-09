import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteUserAvatarAction,
  DeleteUserAvatarActionInput,
} from "@/components/modules/organization/modules/profile/actions/deleteUserAvatarAction";

export const useDeleteUserAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DeleteUserAvatarActionInput) =>
      deleteUserAvatarAction(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries();
    },
  });
};
