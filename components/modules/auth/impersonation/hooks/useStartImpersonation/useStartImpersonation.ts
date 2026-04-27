import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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
  const { setIdentity, clearCurrentUserCache } = useCurrentUser();

  return useMutation({
    mutationFn: async ({ targetUserId }: { targetUserId: string }) => {
      const res = await fetch("/api/auth/impersonate/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ targetUserId }),
      });

      if (!res.ok) {
        throw new Error("Failed to start impersonation");
      }

      return res.json() as Promise<StartResponse>;
    },

    onSuccess: (result) => {
      clearPermissionsStorage();
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
