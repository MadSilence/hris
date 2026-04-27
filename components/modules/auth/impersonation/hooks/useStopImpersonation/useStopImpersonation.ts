import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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
  const { setIdentity, clearCurrentUserCache } = useCurrentUser();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/impersonate/stop", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to stop impersonation");
      }

      return res.json() as Promise<StopResponse>;
    },

    onSuccess: (result) => {
      clearPermissionsStorage();
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
  });
}
