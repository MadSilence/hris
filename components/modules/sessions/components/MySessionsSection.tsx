"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ComputerIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Button } from "@/components/desact/button";
import { Skeleton } from "@/components/desact/skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useDateFormatter } from "@/lib/date";
import { messageForError } from "@/lib/errors/errorMessages";
import { showError } from "@/lib/errors/errorToast";
import type { SessionDTO } from "@/api/modules/sessions/dto";
import { useEndMyOtherSessions, useEndMySession, useMySessions } from "@/components/modules/sessions/hooks";
import { describeUserAgent } from "./describeUserAgent";

const METHOD_LABEL = {
  PASSWORD: "sessions.method.password",
  OIDC: "sessions.method.sso",
  SAML: "sessions.method.sso",
  // A login by Google, Microsoft or an emailed code showed the bare namespace, "auth" (live walk of 2026-11-13).
  GOOGLE: "sessions.method.google",
  MICROSOFT: "sessions.method.microsoft",
  EMAIL_CODE: "sessions.method.emailCode",
} as const satisfies Record<SessionDTO["authMethod"], string>;

/**
 * "Signed-in Sessions" on a person's own preferences (DECISIONS.md § "The decision session, sitting 3",
 * R1.1): every browser signed in as them, and a way to end any but this one — or all the others at once,
 * which is what somebody does when a laptop goes missing.
 *
 * This browser's session is marked and has no button: ending it is signing out, which has its own place.
 */
export const MySessionsSection: React.FC = () => {
  const t = useTranslations("auth");
  const formatDisplayDate = useDateFormatter();
  const sessions = useMySessions();
  const endOne = useEndMySession();
  const endOthers = useEndMyOtherSessions();
  const [confirmOthers, setConfirmOthers] = React.useState(false);
  const [othersError, setOthersError] = React.useState<string | null>(null);

  if (sessions.isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }
  if (sessions.error) return <ErrorState error={sessions.error} />;

  const rows = sessions.data ?? [];
  const others = rows.filter((s) => !s.isCurrent);

  const endAllOthers = async () => {
    setOthersError(null);
    try {
      await endOthers.mutateAsync();
      setConfirmOthers(false);
    } catch (error) {
      setOthersError(messageForError(error));
    }
  };

  return (
    <div className="space-y-3">
      <ul className="divide-y divide-divider rounded-control border border-divider">
        {rows.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <Icon icon={ComputerIcon} className="flex-none text-tertiary" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-body font-medium text-primary">{describeUserAgent(s.userAgent, t)}</span>
                  {s.isCurrent && <StatusBadge status="active" label={t("sessions.thisBrowser")} />}
                </div>
                <p className="truncate text-hint text-tertiary">
                  {t("sessions.meta", {
                    method: t(METHOD_LABEL[s.authMethod]),
                    signedIn: formatDisplayDate(s.createdAt, { style: "medium" }),
                    lastActive: formatDisplayDate(s.lastSeenAt, { style: "medium" }),
                  })}
                  {s.ip ? ` · ${s.ip}` : ""}
                </p>
              </div>
            </div>
            {!s.isCurrent && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={endOne.isPending && endOne.variables === s.id}
                onClick={() => endOne.mutate(s.id, { onError: (error) => showError(error) })}
              >
                {t("sessions.signOut")}
              </Button>
            )}
          </li>
        ))}
      </ul>

      {others.length > 0 && (
        <Button type="button" variant="secondary" onClick={() => setConfirmOthers(true)}>
          {t("sessions.signOutOthers")}
        </Button>
      )}

      <ConfirmActionModal
        isOpen={confirmOthers}
        title={t("sessions.confirmOthers.title")}
        description={t("sessions.confirmOthers.description", { count: others.length })}
        confirmLabel={t("sessions.signOut")}
        isLoading={endOthers.isPending}
        errorMessage={othersError}
        onConfirmAction={endAllOthers}
        onCancelAction={() => {
          setConfirmOthers(false);
          setOthersError(null);
        }}
      />
    </div>
  );
};
