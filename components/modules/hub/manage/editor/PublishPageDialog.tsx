"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Add01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { InlineAlert } from "@/components/desact/alert";
import { Button } from "@/components/desact/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import { Icon } from "@/components/desact/icon";
import { Input } from "@/components/desact/input";
import { RadioGroup, RadioGroupItem } from "@/components/desact/radio-group";
import { DatePicker } from "@/components/ui/DatePicker";
import { dateToISO } from "@/lib/date";
import type { PublishRequest } from "@/models/hub";

export type PublishChoice = "ASK_AGAIN" | "FIX";

/** The default Agree by when asking again: 14 days from today (CM06). */
export const defaultAgreeBy = (today: Date = new Date()): string => {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14);
  return dateToISO(d);
};

/**
 * What the dialog sends. A first publish has no points and no choice. For a published page the editor writes the
 * What changed points; for a must-read page somebody already agreed to, the editor also chooses — ask everyone again
 * (a new version, with its Agree by) or a small fix that keeps agreements (no points, the same version number).
 */
export const buildPublishRequest = (input: {
  firstPublish: boolean;
  showChoice: boolean;
  choice: PublishChoice;
  points: string[];
  agreeBy: string | null;
  mustRead: boolean;
  draftAgreeBy: string | null;
}): PublishRequest => {
  const points = input.points.map((p) => p.trim()).filter(Boolean).slice(0, 20);
  // A must-read page needs a date to agree by. Asking again takes the dialog's; otherwise the page's own, and when
  // the page has none yet, the one the dialog asked for (the walk of 2026-11-12: publishing failed with no word why).
  const ownOrAsked = input.draftAgreeBy ?? input.agreeBy;
  if (input.firstPublish) return { kind: "NEW_VERSION", whatChanged: [], agreeBy: input.mustRead ? ownOrAsked : null };
  if (input.showChoice && input.choice === "FIX") return { kind: "FIX", whatChanged: [], agreeBy: null };
  return {
    kind: "NEW_VERSION",
    whatChanged: points,
    agreeBy: input.mustRead ? (input.showChoice ? input.agreeBy : ownOrAsked) : null,
  };
};

/**
 * Publish (`PublishPageDialog`, CM06, 560): "Publish version {n}?", the What changed points the editor writes
 * (v1 has no assistant, so no "Drafted by AI" label — Q-11), and for a must-read page people already agreed to the
 * choice between asking everyone again and a small fix. A failure keeps the dialog open: the draft is saved.
 */
export const PublishPageDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The number readers will see after a new version. */
  nextVersion: number;
  firstPublish: boolean;
  mustRead: boolean;
  everAgreed: boolean;
  draftAgreeBy: string | null;
  onPublish: (request: PublishRequest) => Promise<void>;
}> = ({ open, onOpenChange, nextVersion, firstPublish, mustRead, everAgreed, draftAgreeBy, onPublish }) => {
  const t = useTranslations("hub");
  const showChoice = !firstPublish && mustRead && everAgreed;
  const [choice, setChoice] = React.useState<PublishChoice>("ASK_AGAIN");
  const [points, setPoints] = React.useState<string[]>([""]);
  const [agreeBy, setAgreeBy] = React.useState<string>(defaultAgreeBy());
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setChoice("ASK_AGAIN");
    setPoints([""]);
    setAgreeBy(defaultAgreeBy());
    setFailed(false);
  }, [open]);

  const fix = showChoice && choice === "FIX";
  const publish = async () => {
    setBusy(true);
    setFailed(false);
    try {
      await onPublish(buildPublishRequest({ firstPublish, showChoice, choice, points, agreeBy, mustRead, draftAgreeBy }));
      onOpenChange(false);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const label = fix ? t("editor.publishFix") : t("editor.publishVersion", { version: nextVersion });

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className="flex max-h-[85vh] flex-col">
        <DialogHeader>
          <DialogTitle>{t("editor.publishTitle", { version: nextVersion })}</DialogTitle>
          <DialogDescription className={firstPublish ? undefined : "sr-only"}>{t("editor.publishLead")}</DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-col gap-5 overflow-y-auto">
          {showChoice && (
            <RadioGroup value={choice} onValueChange={(v) => setChoice(v as PublishChoice)} className="flex flex-col gap-3" aria-label={t("editor.publishTitle", { version: nextVersion })}>
              <label className="flex items-start gap-3 rounded-tint border border-divider p-3">
                <RadioGroupItem value="ASK_AGAIN" className="mt-0.5" />
                <span className="flex flex-col gap-1">
                  <span className="text-body font-medium text-primary">{t("editor.askAgain")}</span>
                  <span className="text-hint text-tertiary">{t("editor.askAgainHint", { version: nextVersion })}</span>
                </span>
              </label>
              {choice === "ASK_AGAIN" && (
                <div className="ml-9 flex w-[180px] flex-col gap-1">
                  <span className="text-label text-secondary">{t("editor.agreeBy")}</span>
                  <DatePicker value={agreeBy} onChange={setAgreeBy} min={dateToISO(new Date())} ariaLabel={t("editor.agreeBy")} />
                </div>
              )}
              <label className="flex items-start gap-3 rounded-tint border border-divider p-3">
                <RadioGroupItem value="FIX" className="mt-0.5" />
                <span className="flex flex-col gap-1">
                  <span className="text-body font-medium text-primary">{t("editor.smallFix")}</span>
                  <span className="text-hint text-tertiary">{t("editor.smallFixHint")}</span>
                </span>
              </label>
            </RadioGroup>
          )}
          {mustRead && !showChoice && !draftAgreeBy && (
            <div className="flex w-[180px] flex-col gap-1">
              <span className="text-label text-secondary">{t("editor.agreeBy")}</span>
              <DatePicker value={agreeBy} onChange={setAgreeBy} min={dateToISO(new Date())} ariaLabel={t("editor.agreeBy")} />
            </div>
          )}
          {!firstPublish && !fix && (
            <div className="flex flex-col gap-2">
              <p className="text-label text-secondary">{t("editor.whatChanged")}</p>
              <p className="text-hint text-tertiary">{t("editor.whatChangedHint")}</p>
              <ul className="flex flex-col gap-2">
                {points.map((point, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span aria-hidden className="size-1.5 shrink-0 rounded-pill bg-accent" />
                    <Input
                      value={point}
                      aria-label={t("editor.pointLabel", { n: i + 1 })}
                      onChange={(e) => setPoints((all) => all.map((p, j) => (j === i ? e.target.value : p)))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t("editor.removePoint")}
                      onClick={() => setPoints((all) => (all.length === 1 ? [""] : all.filter((_, j) => j !== i)))}
                    >
                      <Icon icon={Cancel01Icon} size="sm" />
                    </Button>
                  </li>
                ))}
              </ul>
              <Button type="button" variant="ghost" size="sm" className="w-fit gap-1.5" onClick={() => setPoints((all) => [...all, ""])}>
                <Icon icon={Add01Icon} size="sm" />
                {t("editor.addPoint")}
              </Button>
            </div>
          )}
          {failed && (
            <InlineAlert
              tone="declined"
              title={t("editor.publishFailed")}
              action={
                <Button type="button" variant="secondary" size="sm" onClick={() => void publish()}>
                  {t("page.retry")}
                </Button>
              }
            />
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" disabled={busy} onClick={() => onOpenChange(false)}>
            {t("actions.cancel")}
          </Button>
          <Button type="button" loading={busy} loadingLabel={t("editor.publishing")} onClick={() => void publish()}>
            {firstPublish ? t("editor.publish") : label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
