"use client";

import { Alert02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { useImpersonationContext } from "@/components/providers/ImpersonationProvider";
import { useStopImpersonation } from "@/components/modules/auth/impersonation/hooks/useStopImpersonation";

export function ImpersonationBanner() {
  const { user } = useCurrentUser();
  const { isImpersonating } = useImpersonationContext();
  const stopImpersonation = useStopImpersonation();

  if (!isImpersonating) return null;

  const fullName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
    : "";

  const displayName = fullName || user?.email || "this user";

  return (
    // A page banner states the state of the whole page, and stays neutral (SPEC § 13.7).
    <div className="flex items-center justify-between gap-4 border-b border-divider bg-mist px-6 py-3 text-body text-primary">
      <div className="flex min-w-0 items-center gap-2">
        <Icon icon={Alert02Icon} size="sm" className="shrink-0" />
        <span className="truncate">
          You are viewing the app as <strong>{displayName}</strong>.
        </span>
      </div>

      <Button type="button"
        variant="secondary"
        size="sm"
        disabled={stopImpersonation.isPending}
        onClick={() => stopImpersonation.mutate()}
      >
        {stopImpersonation.isPending ? "Returning…" : "Stop impersonation"}
      </Button>
    </div>
  );
}
