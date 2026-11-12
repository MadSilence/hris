"use client";

import * as React from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { useHubDates } from "../shared";

export type AgreeBarState = "waiting" | "agreeing" | "agreed" | "gone";

/** How long the quiet "You agreed…" line stays before it leaves (CP02). */
export const AGREED_LINE_MS = 5000;

/**
 * The agree bar (`AgreeBar`, CP02): sticky at the bottom, as wide as the reading column. "Agree to version {n} by
 * {d Mon}" — or "— it was due {d Mon}" when overdue — over "{owner} will see that you agreed and when", and
 * **I agree**. Agreeing shows "Agreeing…" and ignores a second click; it succeeds into a quiet line that leaves after
 * 5 s; it fails into a toast with Retry, and the bar stays. No confirm and no undo: an agreement is a record.
 */
export const AgreeBar: React.FC<{
  versionNo: number;
  dueOn: string | null;
  overdue: boolean;
  ownerFirstName: string;
  onAgree: () => Promise<{ versionNo: number; agreedAt: string }>;
}> = ({ versionNo, dueOn, overdue, ownerFirstName, onAgree }) => {
  const t = useTranslations("hub");
  const dates = useHubDates();
  const [state, setState] = React.useState<AgreeBarState>("waiting");
  const [agreedAt, setAgreedAt] = React.useState<string | null>(null);
  const busy = React.useRef(false);

  React.useEffect(() => {
    if (state !== "agreed") return;
    const timer = setTimeout(() => setState("gone"), AGREED_LINE_MS);
    return () => clearTimeout(timer);
  }, [state]);

  const agree = async () => {
    if (busy.current) return;
    busy.current = true;
    setState("agreeing");
    try {
      const result = await onAgree();
      setAgreedAt(result.agreedAt);
      setState("agreed");
    } catch {
      setState("waiting");
      toast.error(t("page.agreeFailed"), { action: { label: t("page.retry"), onClick: () => void agree() } });
    } finally {
      busy.current = false;
    }
  };

  if (state === "gone") return null;

  return (
    <div className="sticky bottom-6 z-20 mt-12">
      {state === "agreed" ? (
        <p role="status" className="flex h-[60px] items-center gap-2 rounded-card bg-card px-5 text-body text-secondary">
          <Icon icon={CheckmarkCircle02Icon} size="md" className="text-status-approved-icon" />
          {t("page.agreedLine", { version: versionNo, date: dates.short(agreedAt) })}
        </p>
      ) : (
        <div className="flex items-center gap-4 rounded-card bg-card py-3 pr-3 pl-5 shadow-popover">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-card-title font-medium text-primary">
              {overdue
                ? t("page.agreeOverdue", { version: versionNo, date: dates.short(dueOn) })
                : dueOn
                  ? t("page.agreeBy", { version: versionNo, date: dates.short(dueOn) })
                  : t("page.agreeTo", { version: versionNo })}
            </span>
            <span className="text-hint text-tertiary">{t("page.ownerWillSee", { name: ownerFirstName })}</span>
          </div>
          <Button type="button" loading={state === "agreeing"} loadingLabel={t("page.agreeing")} onClick={() => void agree()}>
            {t("page.agree")}
          </Button>
        </div>
      )}
    </div>
  );
};
