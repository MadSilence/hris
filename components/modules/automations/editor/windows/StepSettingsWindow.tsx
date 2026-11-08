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
        <Button type="button" variant="ghost" size="icon-sm" aria-label={t("settings.menu")} className="text-tertiary hover:text-secondary">
          <Icon icon={MoreHorizontalIcon} size="sm" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44 p-1">
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

/**
 * The step settings window (Layout 7): on the right, 340, radius 16, level 2. The header names the step and its type;
 * ⋯ and × on the right; the body is the settings part's fields.
 */
export const StepSettingsWindow: React.FC<{
  /** "Step 2A · Ask for approval", or "What starts it". */
  eyebrow: string;
  title: string;
  icon?: IconSvgElement;
  /** Absent for the trigger and in read mode. */
  menu?: StepMenuProps | null;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ eyebrow, title, icon = FlashIcon, menu, onClose, children }) => {
  const t = useTranslations("automationsEditor");
  return (
    <section aria-label={eyebrow} data-test="step-settings" className="flex flex-col rounded-card border border-divider bg-card shadow-popover">
      <header className="flex items-start gap-1 border-b border-divider px-5 pt-4 pb-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="flex items-center gap-1.5 text-hint text-tertiary">
            <Icon icon={icon} size="sm" className="shrink-0" />
            <span className="truncate">{eyebrow}</span>
          </p>
          <h2 className="line-clamp-2 text-card-title text-primary">{title}</h2>
        </div>
        {menu && <StepMenu {...menu} />}
        <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} aria-label={t("settings.close")}>
          <Icon icon={Cancel01Icon} size="sm" />
        </Button>
      </header>
      <div className="flex flex-col gap-4 px-5 py-4">{children}</div>
    </section>
  );
};
