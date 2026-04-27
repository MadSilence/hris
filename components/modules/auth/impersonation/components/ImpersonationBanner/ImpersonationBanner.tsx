"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
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
    <div className="flex items-center justify-between gap-4 border-b bg-yellow-50 px-6 py-3 text-sm text-yellow-950">
      <div className="flex min-w-0 items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0"/>
        <span className="truncate">
          You are viewing the app as <strong>{displayName}</strong>.
        </span>
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={stopImpersonation.isPending}
        onClick={() => stopImpersonation.mutate()}
      >
        {stopImpersonation.isPending ? "Returning..." : "Stop Impersonation"}
      </Button>
    </div>
  );
}
