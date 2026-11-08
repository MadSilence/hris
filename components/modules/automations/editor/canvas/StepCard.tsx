"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Alert02Icon, FlashIcon } from "@hugeicons/core-free-icons";
import { Icon, type IconSvgElement } from "@/components/desact/icon";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/cn";
import type { RunCardState } from "../state/editorLogic";

export type StepCardProps = {
  /** "When" for the trigger, the step's type otherwise. */
  kindLabel: string;
  kindIcon?: IconSvgElement;
  /** The step's number, top right; the trigger has none. */
  number?: string;
  title: string;
  subtitle?: string | null;
  height: number;
  selected?: boolean;
  readOnly?: boolean;
  skipped?: boolean;
  /** On a live automation, a card changed since the last save (F5). */
  edited?: boolean;
  /** F3: the "Add …" / "Choose …" line, with the declined border. */
  needsDetails?: string | null;
  /** K9: the step saves, a run skips it. */
  notConnected?: boolean;
  /** A run is open: this step's state in it (V1). */
  runState?: RunCardState | null;
  /** H1: what noddo AI changed here. */
  changedByAi?: string | null;
  dragging?: boolean;
  /** A dragged card or step is about to land here. */
  dropTarget?: boolean;
  ariaLabel: string;
  onClick?: () => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
};

const RUN_TONE: Record<Exclude<RunCardState, "notStarted">, StatusTone> = {
  done: "approved",
  waiting: "pending",
  failed: "declined",
  skipped: "inactive",
};

/**
 * One card of the canvas (`automations-editor` → New components → StepCard): the kind with its icon, the number, the
 * title and the subtitle; on an open run, the run's state left of the number. 320 wide, radius 10, level 1.
 */
export const StepCard: React.FC<StepCardProps> = ({
  kindLabel,
  kindIcon = FlashIcon,
  number,
  title,
  subtitle,
  height,
  selected = false,
  readOnly = false,
  skipped = false,
  edited = false,
  needsDetails,
  notConnected = false,
  runState,
  changedByAi,
  dragging = false,
  dropTarget = false,
  ariaLabel,
  onClick,
  onKeyDown,
}) => {
  const t = useTranslations("automationsEditor");
  const failed = runState === "failed";
  const declinedBorder = Boolean(needsDetails) || failed;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-pressed={selected}
      data-test="step-card"
      data-state={runState ?? undefined}
      onClick={onClick}
      onKeyDown={onKeyDown}
      style={{ height }}
      className={cn(
        "group flex w-[320px] flex-col overflow-hidden rounded-popover border bg-card p-4 text-left outline-none",
        "transition-[box-shadow,border-color] duration-(--duration-hover) focus-visible:shadow-focus",
        readOnly ? "cursor-pointer" : "cursor-grab",
        dragging ? "shadow-drag" : "shadow-raised hover:shadow-popover",
        selected
          ? "border-accent shadow-focus"
          : declinedBorder
            ? "border-status-declined-fill"
            : dropTarget
              ? "border-dashed border-accent-ring bg-accent-subtle"
              : "border-divider",
        runState === "notStarted" && "opacity-70",
      )}
    >
      <div className="flex items-center gap-1.5 text-hint text-tertiary">
        <Icon icon={kindIcon} size="sm" className="shrink-0" />
        <span className="min-w-0 truncate">{kindLabel}</span>
        {edited && <span className="shrink-0">{t("canvas.edited")}</span>}
        <span className="ml-auto flex shrink-0 items-center gap-1.5">
          {skipped && <StatusBadge status="inactive" size="sm" label={t("canvas.skipped")} />}
          {notConnected && !skipped && <StatusBadge status="draft" size="sm" label={t("canvas.notConnected")} />}
          {runState && runState !== "notStarted" && (
            <StatusBadge status={RUN_TONE[runState]} size="sm" label={t(`canvas.runState.${runState}`)} />
          )}
          {number && <span className="text-hint font-medium text-disabled">{number}</span>}
        </span>
      </div>
      <p className={cn("mt-2 line-clamp-2 text-card-title break-words", skipped ? "text-tertiary" : "text-primary")}>{title}</p>
      {subtitle && <p className="mt-1 line-clamp-2 text-hint text-tertiary">{subtitle}</p>}
      {needsDetails && (
        <p className="mt-1.5 flex items-center gap-1 text-hint text-status-declined-text">
          <Icon icon={Alert02Icon} size="sm" className="shrink-0" />
          {needsDetails}
        </p>
      )}
      {!needsDetails && failed && <p className="mt-1.5 text-hint text-status-declined-text">{t("canvas.failedInRun")}</p>}
      {!needsDetails && runState === "notStarted" && <p className="mt-1.5 text-hint text-tertiary">{t("canvas.notStartedYet")}</p>}
      {changedByAi && <p className="mt-1.5 text-hint text-accent-text">{t("canvas.changedByAi", { what: changedByAi })}</p>}
    </div>
  );
};
