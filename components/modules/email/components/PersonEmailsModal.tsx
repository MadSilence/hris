"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/desact/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import { InlineAlert } from "@/components/desact/alert";
import { Skeleton } from "@/components/desact/skeleton";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ActionStatus } from "@/components/models/ActionStatus";
import { internalApiClient } from "@/components/clients/apiClient";
import { liftEmailSuppressionAction } from "@/components/modules/email/actions";
import { showActionError, showSuccess } from "@/lib/errors/errorToast";
import { useDateFormatter } from "@/lib/date";
import type { EmailLine, PersonEmails } from "@/models/email";

const TONE: Record<EmailLine["status"], StatusTone> = {
  QUEUED: "pending",
  SENT: "approved",
  DELIVERED: "approved",
  FAILED: "declined",
  BOUNCED: "declined",
  COMPLAINED: "declined",
  SUPPRESSED: "inactive",
};

export const personEmailsQueryKey = (userId: string) => ["users", userId, "emails"] as const;

/**
 * A person's last emails and the block on their address (EMAIL_NOTIFICATIONS_DESIGN.md § 10, EM10): how "did
 * they get the invitation?" is answered. Subjects and what happened to them — never the text (F3).
 */
export function PersonEmailsModal({ userId, fullName, open, onCloseAction }: {
  userId: string;
  fullName: string;
  open: boolean;
  onCloseAction: () => void;
}) {
  const t = useTranslations("organization");
  const format = useDateFormatter();
  const queryClient = useQueryClient();
  const [lifting, setLifting] = useState(false);
  const query = useQuery({
    queryKey: personEmailsQueryKey(userId),
    queryFn: () => internalApiClient.get<PersonEmails>(`/users/${userId}/emails`),
    enabled: open,
  });

  const lift = async () => {
    setLifting(true);
    const res = await liftEmailSuppressionAction(userId);
    setLifting(false);
    if (res.status === ActionStatus.ERROR) {
      showActionError(res);
      return;
    }
    showSuccess(t("profile.emails.lifted"));
    void queryClient.invalidateQueries({ queryKey: personEmailsQueryKey(userId) });
  };

  const data = query.data;
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCloseAction(); }}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{t("profile.emails.title", { name: fullName })}</DialogTitle>
          <DialogDescription>{t("profile.emails.description")}</DialogDescription>
        </DialogHeader>

        {query.isLoading && (
          <div className="flex flex-col gap-2 py-2">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-9 w-full" />)}
          </div>
        )}
        {query.isError && <ErrorState error={query.error} />}

        {data && (
          <div className="flex flex-col gap-4 py-2">
            {data.suppression && data.address && (
              <InlineAlert tone="declined">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span>
                    {t("profile.emails.suppressed", {
                      address: data.address,
                      reason: data.suppression.reason,
                      date: format(data.suppression.since),
                    })}
                  </span>
                  <Button size="sm" variant="secondary" loading={lifting} onClick={() => void lift()}>
                    {t("profile.emails.lift")}
                  </Button>
                </div>
              </InlineAlert>
            )}
            {data.emails.length === 0 ? (
              <p className="text-body text-tertiary">{t("profile.emails.empty")}</p>
            ) : (
              <table className="w-full text-body">
                <thead>
                  <tr className="text-left text-label text-tertiary">
                    <th className="py-2 font-normal">{t("profile.emails.columns.subject")}</th>
                    <th className="py-2 font-normal">{t("profile.emails.columns.status")}</th>
                    <th className="py-2 text-right font-normal">{t("profile.emails.columns.date")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.emails.map((e) => (
                    <tr key={e.id} className="border-t border-divider">
                      <td className="max-w-80 truncate py-2 pr-3 text-primary" title={e.subject}>{e.subject}</td>
                      <td className="py-2 pr-3">
                        <StatusBadge size="sm" status={TONE[e.status]} label={t(`profile.emails.status.${e.status}`)} />
                      </td>
                      <td className="py-2 text-right tabular-nums text-tertiary">{format(e.sentAt ?? e.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
