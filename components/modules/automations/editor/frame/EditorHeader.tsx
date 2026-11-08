"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Cancel01Icon, PlayIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { Skeleton } from "@/components/desact/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/desact/tooltip";
import { AutomationIcon, AutomationStatusBadge } from "@/components/modules/automations/shared";
import type { AutomationStatus, TriggerSpec } from "@/models/automations";
import type { HeaderButton } from "../state/editorLogic";

const PRIMARY: HeaderButton[] = ["turnOn", "saveChanges"];

/**
 * The editor's header (`automations-editor` → Layout 2): 64 high, ×, the icon and the name (click → Name and icon),
 * the status pill; on the right Test run, then the buttons of the status.
 */
export const EditorHeader: React.FC<{
  name: string;
  icon: string | null;
  trigger: TriggerSpec | null;
  status: AutomationStatus;
  buttons: HeaderButton[];
  disabled?: Partial<Record<HeaderButton, boolean>>;
  busy?: Partial<Record<HeaderButton, boolean>>;
  canRename: boolean;
  onRename: () => void;
  onClose: () => void;
  onButton: (button: HeaderButton) => void;
}> = ({ name, icon, trigger, status, buttons, disabled = {}, busy = {}, canRename, onRename, onClose, onButton }) => {
  const t = useTranslations("automationsEditor");

  const title = (
    <span className="flex min-w-0 items-center gap-2">
      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-control bg-mist text-secondary">
        <AutomationIcon icon={icon} trigger={trigger} size={16} />
      </span>
      <span className="truncate text-card-title text-primary">{name}</span>
    </span>
  );

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-divider bg-card px-6">
      <Button type="button" variant="secondary" size="icon" onClick={onClose} aria-label={t("header.close")}>
        <Icon icon={Cancel01Icon} />
      </Button>
      <Tooltip>
        <TooltipTrigger asChild>
          {canRename ? (
            <button
              type="button"
              onClick={onRename}
              aria-label={t("header.rename", { name })}
              className="min-w-0 rounded-control px-1 py-1 outline-none hover:bg-subtle focus-visible:shadow-focus"
            >
              {title}
            </button>
          ) : (
            <span className="min-w-0 px-1">{title}</span>
          )}
        </TooltipTrigger>
        <TooltipContent side="bottom">{name}</TooltipContent>
      </Tooltip>
      <AutomationStatusBadge status={status} />
      <div className="ml-auto flex shrink-0 items-center gap-3">
        {buttons.map((button) => (
          <Button
            key={button}
            type="button"
            variant={PRIMARY.includes(button) ? "primary" : "secondary"}
            disabled={disabled[button] || busy[button]}
            aria-busy={busy[button] || undefined}
            onClick={() => onButton(button)}
            data-test={`header-${button}`}
          >
            {button === "testRun" && <Icon icon={PlayIcon} size="sm" />}
            {t(`header.${button}`)}
          </Button>
        ))}
      </div>
    </header>
  );
};

/** The header while the automation loads (F1): a skeleton name, no buttons. */
export const EditorHeaderSkeleton: React.FC<{ onClose: () => void; announce?: boolean }> = ({ onClose, announce = true }) => {
  const t = useTranslations("automationsEditor");
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-divider bg-card px-6">
      <Button type="button" variant="secondary" size="icon" onClick={onClose} aria-label={t("header.close")}>
        <Icon icon={Cancel01Icon} />
      </Button>
      <Skeleton className="size-8" />
      <Skeleton className="h-5 w-48" />
      {announce && <span className="sr-only" role="status">{t("header.loading")}</span>}
    </header>
  );
};
