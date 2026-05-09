import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  uploadUserAvatarAction,
  UploadUserAvatarActionInput,
} from "@/components/modules/organization/modules/profile/actions/uploadUserAvatarAction";

export const useUploadUserAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UploadUserAvatarActionInput) =>
      uploadUserAvatarAction(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries();
    },
  });
};
