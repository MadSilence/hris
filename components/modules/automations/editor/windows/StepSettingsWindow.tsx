"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Cancel01Icon, Copy01Icon, Delete02Icon, FlashIcon, MoreHorizontalIcon, SkipForwardIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/desact/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/desact/dropdown-menu";
import { Icon, type IconSvgElement } from "@/components/desact/icon";
import { RowAction, RowActionDestructive } from "@/components/ui/RowActionsMenu";

export type StepMenuProps = {
  skipped: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDuplicate: () => void;
  onToggleSkip: () => void;
  onRemove: () => void;
};

/** The step menu ⋯ (G4): Duplicate step · Skip for now / Don't skip · a separator · Remove step in red. */
export const StepMenu: React.FC<StepMenuProps> = ({ skipped, open, onOpenChange, onDuplicate, onToggleSkip, onRemove }) => {
  const t = useTranslations("automationsEditor");
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon-sm" aria-label={t("settings.menu")}>
          <Icon icon={MoreHorizontalIcon} size="sm" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px] p-1">
        <RowAction icon={<Icon icon={Copy01Icon} size="sm" />} onClick={onDuplicate}>
          {t("settings.duplicate")}
        </RowAction>
        <RowAction icon={<Icon icon={SkipForwardIcon} size="sm" />} onClick={onToggleSkip}>
          {skipped ? t("settings.unskip") : t("settings.skip")}
        </RowAction>
        <RowActionDestructive icon={<Icon icon={Delete02Icon} size="sm" />} onClick={onRemove}>
          {t("settings.remove")}
        </RowActionDestructive>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/** The trigger's menu ⋯: what starts it can be changed from there, like a step's type is chosen in Add a step. */
export const TriggerMenu: React.FC<{ onChange: () => void }> = ({ onChange }) => {
  const t = useTranslations("automationsEditor");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon-sm" aria-label={t("settings.menu")}>
          <Icon icon={MoreHorizontalIcon} size="sm" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px] p-1">
        <RowAction icon={<Icon icon={FlashIcon} size="sm" />} onClick={onChange}>
          {t("settings.changeTrigger")}
        </RowAction>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/**
 * The step settings window (Layout 7, the designers' fixes C1–C4): on the right, 340, radius 16, 1.5 px of the accent
 * ring, level 3. The header is "Step N" with the type's icon over the step's type ("What starts it" over the trigger's
 * name); ⋯ and × on the right; the body is the settings part's fields.
 */
export const StepSettingsWindow: React.FC<{
  /** "Step 2A", or "What starts it". */
  eyebrow: string;
  /** The step's type ("Send a notification"), or the trigger's name. */
  title: string;
  icon?: IconSvgElement;
  /** Absent in read mode. */
  menu?: StepMenuProps | null;
  /** The trigger's ⋯, in place of a step's. */
  triggerMenu?: { onChange: () => void } | null;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ eyebrow, title, icon = FlashIcon, menu, triggerMenu, onClose, children }) => {
  const t = useTranslations("automationsEditor");
  return (
    <section
      aria-label={eyebrow}
      data-test="step-settings"
      className="flex min-h-0 flex-col rounded-card border-[1.5px] border-accent-ring bg-card shadow-dialog"
    >
      <header className="flex items-start gap-1 border-b border-divider pt-4 pr-3 pb-3 pl-5">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="flex items-center gap-2 text-hint font-medium text-tertiary">
            <Icon icon={icon} size="sm" className="shrink-0" />
            <span className="truncate">{eyebrow}</span>
          </p>
          <h2 className="line-clamp-2 text-card-title text-primary">{title}</h2>
        </div>
        {menu && <StepMenu {...menu} />}
        {!menu && triggerMenu && <TriggerMenu {...triggerMenu} />}
        <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} aria-label={t("settings.close")}>
          <Icon icon={Cancel01Icon} size="sm" />
        </Button>
      </header>
      <div className="flex min-h-0 flex-col gap-4 overflow-y-auto px-5 pt-4 pb-5">{children}</div>
    </section>
  );
};
