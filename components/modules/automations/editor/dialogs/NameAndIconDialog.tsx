"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Cancel01Icon, FlashIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/desact/button";
import { InlineAlert } from "@/components/desact/alert";
import { FieldError } from "@/components/desact/field-error";
import { Icon } from "@/components/desact/icon";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { Textarea } from "@/components/desact/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import {
  AUTOMATION_ICONS,
  AutomationStatusBadge,
  defaultIconFor,
  isAutomationIconCode,
  type AutomationIconCode,
} from "@/components/modules/automations/shared";
import { cn } from "@/lib/cn";
import type { AutomationStatus, TriggerSpec } from "@/models/automations";

export const NAME_MAX = 60;

export type NameAndIcon = { name: string; description: string; icon: string | null };

/**
 * Name and icon (I1, the designers' fixes G6–G10): on the first save, and from the name in the header. 560 wide, its
 * parts 16 apart. The icon is picked from what starts it — 40 tiles, 8 to a row — the name suggested from the steps;
 * 60 characters at most; a description; and how it looks in the list, as the list's own card. On a draft the button
 * reads "Save draft".
 */
export const NameAndIconDialog: React.FC<{
  open: boolean;
  /** The first save says "Save draft"; a rename "Save". */
  firstSave: boolean;
  initial: NameAndIcon;
  /** The name was suggested from the steps, not typed. */
  suggested: boolean;
  status: AutomationStatus;
  trigger: TriggerSpec | null;
  triggerLine: string | null;
  saving: boolean;
  error: string | null;
  onCancel: () => void;
  onSave: (value: NameAndIcon) => void;
}> = ({ open, firstSave, initial, status, trigger, triggerLine, saving, error, onCancel, onSave }) => {
  const t = useTranslations("automationsEditor");
  const [name, setName] = React.useState(initial.name);
  const [description, setDescription] = React.useState(initial.description);
  const [icon, setIcon] = React.useState<AutomationIconCode>(isAutomationIconCode(initial.icon) ? initial.icon : defaultIconFor(trigger));
  const [touched, setTouched] = React.useState(false);
  const nameId = React.useId();
  const descriptionId = React.useId();

  // Filled afresh each time it opens — not on every render of the editor behind it, which would undo the typing.
  const latest = React.useRef({ initial, trigger });
  latest.current = { initial, trigger };
  React.useEffect(() => {
    if (!open) return;
    const { initial: from, trigger: startsWith } = latest.current;
    setName(from.name);
    setDescription(from.description);
    setIcon(isAutomationIconCode(from.icon) ? from.icon : defaultIconFor(startsWith));
    setTouched(false);
  }, [open]);

  const trimmed = name.trim();
  const nameError = touched && trimmed.length === 0 ? t("nameDialog.nameRequired") : null;
  const codes = Object.keys(AUTOMATION_ICONS) as AutomationIconCode[];

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent size="md" hideClose aria-describedby={undefined}>
        <Button type="button" variant="ghost" size="icon-sm" onClick={onCancel} aria-label={t("nameDialog.cancel")} className="absolute top-4 right-4">
          <Icon icon={Cancel01Icon} />
        </Button>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            setTouched(true);
            if (trimmed.length === 0) return;
            onSave({ name: trimmed, description: description.trim(), icon });
          }}
        >
          <DialogHeader>
            <DialogTitle>{t("nameDialog.title")}</DialogTitle>
          </DialogHeader>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-label text-primary">{t("nameDialog.icon")}</legend>
            <div role="radiogroup" aria-label={t("nameDialog.icon")} className="grid w-fit grid-cols-8 gap-2">
              {codes.map((code, i) => (
                <button
                  key={code}
                  type="button"
                  role="radio"
                  aria-checked={icon === code}
                  aria-label={t("nameDialog.iconOption", { number: i + 1 })}
                  onClick={() => setIcon(code)}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-control border outline-none transition-colors duration-(--duration-hover)",
                    "focus-visible:shadow-focus",
                    icon === code ? "border-accent bg-accent-muted text-accent-text" : "border-transparent bg-mist text-secondary hover:bg-divider",
                  )}
                >
                  <Icon icon={AUTOMATION_ICONS[code]} />
                </button>
              ))}
            </div>
            <p className="text-hint text-tertiary">{t("nameDialog.iconHint")}</p>
          </fieldset>

          <div className="flex flex-col gap-2">
            <Label htmlFor={nameId}>{t("nameDialog.name")}</Label>
            <div className="relative">
              <Input
                id={nameId}
                value={name}
                maxLength={NAME_MAX}
                autoFocus
                aria-invalid={Boolean(nameError)}
                onChange={(e) => setName(e.currentTarget.value)}
                onBlur={() => setTouched(true)}
                className="pr-16"
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-hint text-tertiary tabular-nums">
                {t("nameDialog.counter", { count: name.length, max: NAME_MAX })}
              </span>
            </div>
            {/* G8: the hint stands under Name whether or not the name was changed. */}
            {nameError ? <FieldError>{nameError}</FieldError> : <p className="text-hint text-tertiary">{t("nameDialog.suggested")}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={descriptionId}>{t("nameDialog.description")}</Label>
            <Textarea id={descriptionId} value={description} rows={2} className="h-16 min-h-16" onChange={(e) => setDescription(e.currentTarget.value)} />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-label text-primary">{t("nameDialog.preview")}</p>
            {/* G9: the list's own card (A7–A10) on a #F7F7F8 box. */}
            <div className="rounded-popover bg-subtle p-3">
              <div className="flex w-[300px] flex-col gap-2 rounded-card border border-divider bg-card p-4 shadow-card">
                <div className="flex h-8 items-center">
                  <AutomationStatusBadge status={status} />
                </div>
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-control bg-mist text-secondary">
                    <Icon icon={AUTOMATION_ICONS[icon]} />
                  </span>
                  <span className="line-clamp-2 min-w-0 pt-1.75 text-card-title break-words text-primary">{trimmed || t("nameDialog.name")}</span>
                </div>
                {triggerLine && (
                  <p className="flex min-w-0 items-center gap-2 text-body text-secondary">
                    <Icon icon={FlashIcon} size="sm" className="shrink-0 text-tertiary" />
                    <span className="truncate">{triggerLine}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {error && <InlineAlert tone="declined">{error}</InlineAlert>}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onCancel}>
              {t("nameDialog.cancel")}
            </Button>
            <Button type="submit" aria-busy={saving} disabled={saving}>
              {firstSave || status === "DRAFT" ? t("nameDialog.saveDraft") : t("nameDialog.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
