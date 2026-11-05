"use client";

import { Alert02Icon } from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { useImpersonationContext } from "@/components/providers/ImpersonationProvider";
import { useStopImpersonation } from "@/components/modules/auth/impersonation/hooks/useStopImpersonation";

export function ImpersonationBanner() {
  const t = useTranslations("auth");
  const { user } = useCurrentUser();
  const { isImpersonating } = useImpersonationContext();
  const stopImpersonation = useStopImpersonation();

  if (!isImpersonating) return null;

  const fullName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
    : "";

  const displayName = fullName || user?.email || t("impersonation.thisUser");

  return (
    // A page banner states the state of the whole page, and stays neutral (SPEC § 13.7).
    <div className="flex items-center justify-between gap-4 border-b border-divider bg-mist px-6 py-3 text-body text-primary">
      <div className="flex min-w-0 items-center gap-2">
        <Icon icon={Alert02Icon} size="sm" className="shrink-0" />
        <span className="truncate">
          {t.rich("impersonation.viewingAs", { name: displayName, b: (chunks) => <strong>{chunks}</strong> })}
        </span>
      </div>

      <Button type="button"
        variant="secondary"
        size="sm"
        disabled={stopImpersonation.isPending}
        onClick={() => stopImpersonation.mutate()}
      >
        {stopImpersonation.isPending ? t("impersonation.returning") : t("impersonation.stop")}
      </Button>
    </div>
  );
}
