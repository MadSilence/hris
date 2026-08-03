import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { internalApiClient } from "@/components/clients/apiClient";
import { clearPermissionsStorage } from "@/components/auth/permissionsStorage";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";

type StartResponse = {
  ok: boolean;
  impersonating: boolean;
  actorId: string;
  subjectId: string;
};

export function useStartImpersonation() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setIdentity, clearCurrentUserCache } = useCurrentUser();

  return useMutation({
    mutationFn: async ({ targetUserId }: { targetUserId: string }) => {
      return internalApiClient.post<StartResponse>("/auth/impersonate/start", { targetUserId });
    },

    onSuccess: (result) => {
      clearPermissionsStorage();
      void queryClient.invalidateQueries();
      clearCurrentUserCache();

      setIdentity({
        id: result.subjectId,
        impersonating: true,
        actorId: result.actorId,
        subjectId: result.subjectId,
      });

      router.push("/organization/people");
      router.refresh();
    },
  });
}
