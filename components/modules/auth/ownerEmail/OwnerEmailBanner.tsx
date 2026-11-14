"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import { FormError } from "@/components/feedback/FormError";
import { CodeInput } from "@/components/modules/auth/layout";
import { ResendLine } from "@/components/modules/auth/components/ResendLine";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { messageForError } from "@/lib/errors/errorMessages";

type OwnerEmailStatus = { unverified: boolean; email: string | null };

export const OWNER_EMAIL_QK = ["OWNER_EMAIL"] as const;

/**
 * An owner who registered with an address Microsoft did not vouch for (SIGN_IN_IMPLEMENTATION_DESIGN.md § 6.3): until
 * they confirm it, the company sends no email and invites nobody. A page banner — neutral, it states the state of the
 * whole app (SPEC § 13.7) — and a dialog with the six boxes. Nobody else ever sees it.
 */
export function OwnerEmailBanner() {
  const t = useTranslations("auth");
  const { internalApiClient } = useAppDataContext();
  const queryClient = useQueryClient();
  const status = useQuery<OwnerEmailStatus>({
    queryKey: OWNER_EMAIL_QK,
    queryFn: () => internalApiClient.get<OwnerEmailStatus>("/company/owner-email"),
    staleTime: 5 * 60_000,
  });
  const [open, setOpen] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  if (!status.data?.unverified) return null;
  const email = status.data.email ?? "";

  const send = async (): Promise<string | null> => {
    try {
      await internalApiClient.post("/company/owner-email/code");
      return null;
    } catch (err) {
      return messageForError(err);
    }
  };

  const start = async () => {
    setCode("");
    setError(null);
    setOpen(true);
    setError(await send());
  };

  const verify = async (typed: string) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await internalApiClient.post("/company/owner-email/verify", { code: typed });
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: OWNER_EMAIL_QK });
    } catch (err) {
      setError(messageForError(err));
      setCode("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 border-b border-divider bg-mist px-6 py-3 text-body text-primary">
        <div className="flex min-w-0 items-center gap-2">
          <Icon icon={Mail01Icon} size="sm" className="shrink-0" />
          <span className="min-w-0 [overflow-wrap:anywhere]">
            {t.rich("ownerEmail.banner", { email, b: (chunks) => <strong>{chunks}</strong> })}
          </span>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={start}>{t("ownerEmail.confirm")}</Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ownerEmail.title")}</DialogTitle>
            <DialogDescription>
              {t.rich("ownerEmail.lead", { email, b: (chunks) => <b className="font-medium text-primary">{chunks}</b> })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <CodeInput value={code} onChange={setCode} onComplete={verify} invalid={Boolean(error)} disabled={busy}
                       autoFocus label={t("ownerEmail.codeLabel")} />
            <FormError message={error} />
            <ResendLine onResend={send} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
