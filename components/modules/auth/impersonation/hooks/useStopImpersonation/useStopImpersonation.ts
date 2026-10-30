import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { internalApiClient, sessionNavigation } from "@/components/clients/apiClient";
import { UnauthorizedError } from "@/components/clients/exceptions";
import { clearPermissionsStorage } from "@/components/auth/permissionsStorage";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";

type StopResponse = {
  ok: boolean;
  impersonating: boolean;
  actorId: string;
  subjectId: string;
};

export function useStopImpersonation() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setIdentity, clearCurrentUserCache } = useCurrentUser();

  return useMutation({
    mutationFn: async () => {
      return internalApiClient.post<StopResponse>("/auth/impersonate/stop");
    },

    onSuccess: (result) => {
      clearPermissionsStorage();
      void queryClient.invalidateQueries();
      clearCurrentUserCache();

      setIdentity({
        id: result.subjectId,
        impersonating: false,
        actorId: result.actorId,
        subjectId: result.subjectId,
      });

      router.push("/organization/people");
      router.refresh();
    },

    // A 401 here is the backend refusing the actor a session of their own — blocked or terminated
    // while impersonating. The impersonated token still works until it expires, so the session probe
    // calls it alive and nothing would move: the actor would stay inside the subject's session. End it.
    onError: async (error) => {
      if (!(error instanceof UnauthorizedError)) return;
      await internalApiClient.post("/auth/logout").catch(() => undefined);
      sessionNavigation.redirectToLogin();
    },
  });
}
