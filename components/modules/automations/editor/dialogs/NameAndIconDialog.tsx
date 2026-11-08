"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { FlashIcon } from "@hugeicons/core-free-icons";
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
 * Name and icon (I1): on the first save, and from the name in the header. The icon is picked from what starts it, the
 * name suggested from the steps; 60 characters at most; a description; and how it looks in the list.
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
}> = ({ open, firstSave, initial, suggested, status, trigger, triggerLine, saving, error, onCancel, onSave }) => {
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
      <DialogContent size="md" aria-describedby={undefined}>
        <form
          className="flex flex-col gap-5"
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
            <div role="radiogroup" aria-label={t("nameDialog.icon")} className="flex flex-wrap gap-2">
              {codes.map((code, i) => (
                <button
                  key={code}
                  type="button"
                  role="radio"
                  aria-checked={icon === code}
                  aria-label={t("nameDialog.iconOption", { number: i + 1 })}
                  onClick={() => setIcon(code)}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-control border text-secondary outline-none transition-colors duration-(--duration-hover)",
                    "hover:bg-subtle focus-visible:shadow-focus",
                    icon === code ? "border-accent bg-accent-subtle text-accent-text" : "border-transparent bg-mist",
                  )}
                >
                  <Icon icon={AUTOMATION_ICONS[code]} size="sm" />
                </button>
              ))}
            </div>
            <p className="text-hint text-tertiary">{t("nameDialog.iconHint")}</p>
          </fieldset>

          <div className="flex flex-col gap-1.5">
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
            {nameError ? <FieldError>{nameError}</FieldError> : suggested && <p className="text-hint text-tertiary">{t("nameDialog.suggested")}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={descriptionId}>{t("nameDialog.description")}</Label>
            <Textarea id={descriptionId} value={description} rows={2} onChange={(e) => setDescription(e.currentTarget.value)} />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-label text-primary">{t("nameDialog.preview")}</p>
            <div className="rounded-popover bg-mist p-3">
              <div className="flex w-72 flex-col gap-3 rounded-card border border-divider bg-card p-4">
                <AutomationStatusBadge status={status} />
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-control border border-divider text-secondary">
                    <Icon icon={AUTOMATION_ICONS[icon]} size="sm" />
                  </span>
                  <span className="line-clamp-2 text-card-title text-primary">{trimmed || t("nameDialog.name")}</span>
                </div>
                {triggerLine && (
                  <p className="flex items-center gap-1.5 text-label text-secondary">
                    <Icon icon={FlashIcon} size="sm" className="text-tertiary" />
                    {triggerLine}
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
              {firstSave ? t("nameDialog.saveDraft") : t("nameDialog.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
