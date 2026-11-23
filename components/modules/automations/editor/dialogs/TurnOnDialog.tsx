"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { FlashIcon, Notification01Icon, PlayIcon, SkipForwardIcon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/desact/button";
import { Checkbox } from "@/components/desact/checkbox";
import { FieldError } from "@/components/desact/field-error";
import { InlineAlert } from "@/components/desact/alert";
import { Icon, type IconSvgElement } from "@/components/desact/icon";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/desact/radio-group";
import { useDisplayLocale } from "@/lib/date";
import type { AutomationCheck, BackfillChoice } from "@/models/automations";
import { messagesNow, needsVolumeTick } from "../state/editorLogic";

/** What waits for an automation as it is turned on (V6) — its noun and its hint follow what starts it. */
export type WaitingKind = "requests" | "hires" | "dates" | "people" | "cases";

// G14: rows with 20 px icons 12 apart, the icon in text-secondary (board F4, V6).
const Line: React.FC<{ icon: IconSvgElement; children: React.ReactNode }> = ({ icon, children }) => (
  <li className="flex items-start gap-3 text-body text-primary">
    <Icon icon={icon} size="md" className="shrink-0 text-secondary" />
    <span>{children}</span>
  </li>
);

/**
 * Turn on (F4), and with cases already waiting (V6): who it runs for, what it starts with, who hears from it; with
 * waiting cases the choice to take them in, and over the threshold "I understand, send them" — Turn on pressed without
 * it says so under the box (NEVER-DISABLED).
 */
export const TurnOnDialog: React.FC<{
  open: boolean;
  name: string;
  check: AutomationCheck;
  /** Who it runs for is everyone: no conditions. */
  everyone: boolean;
  /** Time-off events wait as requests. */
  requests: boolean;
  /** V6: what is already waiting, in the trigger's words. */
  waitingKind?: WaitingKind;
  /** K9: the steps a run skips because they are not connected yet, by name. */
  notConnected: string[];
  turning: boolean;
  error: string | null;
  onCancel: () => void;
  onTestFirst: () => void;
  onConfirm: (backfill: BackfillChoice, confirmVolume: boolean) => void;
}> = ({ open, name, check, everyone, requests, waitingKind = requests ? "requests" : "cases", notConnected, turning, error, onCancel, onTestFirst, onConfirm }) => {
  const t = useTranslations("automationsEditor");
  const locale = useDisplayLocale();
  const [backfill, setBackfill] = React.useState<BackfillChoice>("NONE");
  const [understood, setUnderstood] = React.useState(false);
  const [tried, setTried] = React.useState(false);
  React.useEffect(() => {
    if (open) {
      setBackfill("NONE");
      setUnderstood(false);
      setTried(false);
    }
  }, [open]);

  const list = (items: string[]) => new Intl.ListFormat(locale, { type: "conjunction" }).format(items);
  const waiting = check.waitingCases > 0;
  const tick = needsVolumeTick(check, backfill);
  const canTurnOn = !turning && (!tick || understood);

  // Right away when the waiting cases send more than one firing does; otherwise each time it runs.
  const now = messagesNow(check, backfill);
  const bold = (chunks: React.ReactNode) => <strong className="font-semibold">{chunks}</strong>;

  // F4: the count in bold — "It runs for 57 people." with no filter, "It runs for 48 people in Poland and Lithuania."
  const runsFor =
    !everyone && check.places.length > 0
      ? t.rich("turnOnDialog.runsForIn", { count: check.matchingCount, places: list(check.places), b: bold })
      : t.rich("turnOnDialog.runsFor", { count: check.matchingCount, b: bold });
  const volumeAlert = tick ? (
    <InlineAlert tone="pending">
      <p>
        {now > check.messagesPerFiring
          ? t.rich("turnOnDialog.volume", { count: now, b: bold })
          : t.rich("turnOnDialog.volumeEach", { count: check.messagesPerFiring, b: bold })}
      </p>
      <label className="mt-2 flex cursor-pointer items-center gap-2 text-primary">
        <Checkbox
          checked={understood}
          onCheckedChange={(v) => setUnderstood(v === true)}
          aria-invalid={(tried && !understood) || undefined}
        />
        {t("turnOnDialog.volumeConfirm")}
      </label>
      {tried && !understood && <FieldError>{t("turnOnDialog.volumeRequired")}</FieldError>}
    </InlineAlert>
  ) : null;

  const option = (value: BackfillChoice, label: string, hint?: string) => (
    <label className="flex cursor-pointer items-start gap-3">
      <RadioGroupItem value={value} className="mt-0.5" aria-label={label} />
      <span className="flex flex-col gap-0.5">
        <span className="text-body text-primary">{label}</span>
        {/* G14: the radio list's hints are 13/18. */}
        {hint && <span className="text-label font-normal text-tertiary">{hint}</span>}
      </span>
    </label>
  );

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent size="md" aria-describedby={undefined}>
        <form
          // G14: one column, 16 apart.
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (turning) return;
            if (!canTurnOn) {
              setTried(true);
              return;
            }
            onConfirm(backfill, tick && understood);
          }}
        >
          <DialogHeader>
            <DialogTitle>{t("turnOnDialog.title", { name })}</DialogTitle>
          </DialogHeader>

          {waiting ? (
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-3 text-label text-primary">{t("turnOnDialog.whoQuestion")}</legend>
              <RadioGroup value={backfill} onValueChange={(v) => setBackfill(v as BackfillChoice)}>
                {option("NONE", t(`turnOnDialog.waiting.${waitingKind}.onlyNew`))}
                {option(
                  "ALL",
                  t(`turnOnDialog.waiting.${waitingKind}.also`, { count: check.waitingCases }),
                  // DQ-02: only a hire keeps a hint; nothing says "They start right away" any more.
                  waitingKind === "hires" ? t("turnOnDialog.waiting.hires.hint") : undefined,
                )}
              </RadioGroup>
              {volumeAlert}
            </fieldset>
          ) : (
            <ul className="flex flex-col gap-3">
              <Line icon={UserGroupIcon}>{runsFor}</Line>
              <Line icon={FlashIcon}>{requests ? t("turnOnDialog.startsWithRequests") : t("turnOnDialog.startsFromToday")}</Line>
              <Line icon={Notification01Icon}>
                {check.audiences.length > 0 ? t("turnOnDialog.hears", { who: list(check.audiences) }) : t("turnOnDialog.hearsNobody")}
              </Line>
            </ul>
          )}
          {!waiting && volumeAlert}

          {notConnected.length > 0 && (
            <p className="flex items-start gap-3 text-body text-secondary">
              <Icon icon={SkipForwardIcon} size="md" className="shrink-0 text-secondary" />
              {t("turnOnDialog.notConnected", { count: notConnected.length, steps: list(notConnected) })}
            </p>
          )}

          {error && <InlineAlert tone="declined">{error}</InlineAlert>}

          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="link" onClick={onTestFirst} className="sm:mr-auto">
              <Icon icon={PlayIcon} size="sm" />
              {t("turnOnDialog.testFirst")}
            </Button>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button type="button" variant="ghost" onClick={onCancel}>
                {t("turnOnDialog.cancel")}
              </Button>
              <Button type="submit" loading={turning}>
                {t("turnOnDialog.confirm")}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
