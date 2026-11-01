"use client";

import * as React from "react";
import { Monitor } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDisplayDate } from "@/lib/date";
import { messageForError } from "@/lib/errors/errorMessages";
import { showError } from "@/lib/errors/errorToast";
import type { SessionDTO } from "@/api/modules/sessions/dto";
import { useEndMyOtherSessions, useEndMySession, useMySessions } from "@/components/modules/sessions/hooks";
import { describeUserAgent } from "./describeUserAgent";

const METHOD_LABEL: Record<SessionDTO["authMethod"], string> = {
  PASSWORD: "Password",
  OIDC: "Single sign-on",
  SAML: "Single sign-on",
};

/**
 * "Signed-in Sessions" on a person's own preferences (DECISIONS.md § "The decision session, sitting 3",
 * R1.1): every browser signed in as them, and a way to end any but this one — or all the others at once,
 * which is what somebody does when a laptop goes missing.
 *
 * This browser's session is marked and has no button: ending it is signing out, which has its own place.
 */
export const MySessionsSection: React.FC = () => {
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
      <ul className="divide-y divide-brown-100 rounded-lg border border-brown-200">
        {rows.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <Monitor className="h-5 w-5 flex-none text-brown-400" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-foreground">{describeUserAgent(s.userAgent)}</span>
                  {s.isCurrent && <StatusBadge status="active" label="This Browser" />}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {METHOD_LABEL[s.authMethod]} · signed in {formatDisplayDate(s.createdAt, { style: "medium" })} ·
                  last active {formatDisplayDate(s.lastSeenAt, { style: "medium" })}
                  {s.ip ? ` · ${s.ip}` : ""}
                </p>
              </div>
            </div>
            {!s.isCurrent && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={endOne.isPending && endOne.variables === s.id}
                onClick={() => endOne.mutate(s.id, { onError: (error) => showError(error) })}
              >
                Sign Out
              </Button>
            )}
          </li>
        ))}
      </ul>

      {others.length > 0 && (
        <Button type="button" variant="outline" onClick={() => setConfirmOthers(true)}>
          Sign Out Everywhere Else
        </Button>
      )}

      <ConfirmActionModal
        isOpen={confirmOthers}
        title="Sign out everywhere else?"
        description={`${others.length} other ${others.length === 1 ? "browser is" : "browsers are"} signed in as you. They are signed out at once; this one stays.`}
        confirmLabel="Sign Out"
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
