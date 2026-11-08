"use client";

import * as React from "react";
import Link from "next/link";
import {
  Archive02Icon,
  CancelCircleIcon,
  Clock01Icon,
  Copy01Icon,
  Delete02Icon,
  PencilEdit02Icon,
  PowerIcon,
  UserIcon,
  UserSwitchIcon,
  ArrowTurnBackwardIcon,
  Wrench01Icon,
} from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";

import { Button } from "@/components/desact/button";
import { Icon, type IconSvgElement } from "@/components/desact/icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/desact/tooltip";
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { useAutomationWords } from "./seams";
import {
  AutomationIcon,
  AutomationStatusBadge,
  PersonAvatar,
  triggerLineIcon,
} from "@/components/modules/automations/shared";
import type { AutomationSummary } from "@/models/automations";
import { formatShortDate, useDisplayLanguage } from "@/lib/date";
import { cn } from "@/lib/cn";
import { automationsHref, menuFor, pauseFixFor, type MenuItem, type PauseFix } from "./listModel";
import { daysBetween, useWhen } from "./format";

export type CardAction = MenuItem | PauseFix | "seeWhy";

const MENU_ICONS: Record<MenuItem, IconSvgElement> = {
  edit: PencilEdit02Icon,
  duplicate: Copy01Icon,
  turnOff: PowerIcon,
  turnOn: PowerIcon,
  runHistory: Clock01Icon,
  changeOwner: UserSwitchIcon,
  archive: Archive02Icon,
  delete: Delete02Icon,
  unarchive: ArrowTurnBackwardIcon,
};

const PAUSE_FIX_ICONS: Record<PauseFix, IconSvgElement> = {
  makeMeOwner: UserIcon,
  fixStep: Wrench01Icon,
  turnOn: PowerIcon,
};

/**
 * One automation on the list (`automations-list` → AutomationCard): the status and ⋯ on top, the icon tile and the
 * name (two lines, then the full name in a tooltip), what starts it, and a footer with the last run — or why it is
 * paused and the one button that fixes it — with the owner's avatar in the bottom-right corner. Every card is 212 high.
 *
 * The card opens the automation; the ⋯ menu, the pause button and "See why" sit above that link. A viewer (`canManage`
 * false) sees no ⋯, no pause button and no "See why".
 */
export const AutomationCard: React.FC<{
  automation: AutomationSummary;
  canManage: boolean;
  onAction: (action: CardAction, automation: AutomationSummary) => void;
}> = ({ automation, canManage, onAction }) => {
  const t = useTranslations("automationsList");
  const tShared = useTranslations("automations");
  const words = useAutomationWords();
  const fix = canManage ? pauseFixFor(automation) : null;
  const menu = canManage ? menuFor(automation) : [];
  const trigger = automation.trigger;
  const startsWhen = trigger ? words.triggerLine(trigger) : "";

  return (
    <article
      data-test="automation-card"
      data-status={automation.status}
      className={cn(
        "group relative flex h-[212px] flex-col rounded-card border border-divider bg-card p-4 shadow-card",
        "transition-shadow duration-(--duration-hover) hover:shadow-raised focus-within:shadow-raised",
      )}
    >
      {/* The whole card opens the automation; what sits above it is lifted over the link. */}
      <Link
        href={automationsHref.open(automation.id)}
        aria-label={automation.name}
        className="absolute inset-0 rounded-card focus-visible:shadow-focus focus-visible:outline-none"
      />

      <div className="flex h-8 items-center justify-between">
        <AutomationStatusBadge status={automation.status} />
        {menu.length > 0 ? (
          <div className="relative z-10">
            <RowActionsMenu label={t("card.actions", { name: automation.name })} stopPropagation>
              {menu.map((item) =>
                item === "delete" ? (
                  <RowActionDestructive
                    key={item}
                    icon={<Icon icon={MENU_ICONS[item]} size="sm" />}
                    onClick={() => onAction(item, automation)}
                  >
                    {t(`menu.${item}`)}
                  </RowActionDestructive>
                ) : (
                  <RowAction key={item} icon={<Icon icon={MENU_ICONS[item]} size="sm" />} onClick={() => onAction(item, automation)}>
                    {t(`menu.${item}`)}
                  </RowAction>
                ),
              )}
            </RowActionsMenu>
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex items-start gap-3">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-control bg-mist text-tertiary">
          <AutomationIcon icon={automation.icon} trigger={trigger} size={20} />
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <h3 className="line-clamp-2 min-w-0 pt-1.5 text-card-title break-words text-primary">{automation.name}</h3>
          </TooltipTrigger>
          <TooltipContent>{automation.name}</TooltipContent>
        </Tooltip>
      </div>

      {startsWhen ? (
        <p className="mt-2 flex min-w-0 items-center gap-2 text-body text-secondary">
          <Icon icon={triggerLineIcon(trigger)} size="sm" className="shrink-0 text-tertiary" />
          <span className="truncate">{startsWhen}</span>
        </p>
      ) : null}

      <div className="mt-auto flex flex-col gap-2 border-t border-divider pt-3">
        {automation.status === "PAUSED" && automation.pause ? <PauseSentence automation={automation} /> : null}
        <div className="flex min-h-6 items-center justify-between gap-3">
          <div className="min-w-0 flex-1 pr-3">
            {fix ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="relative z-10 h-7"
                onClick={() => onAction(fix, automation)}
              >
                <Icon icon={PAUSE_FIX_ICONS[fix]} size="sm" />
                {tShared(`pause.${fix}`)}
              </Button>
            ) : (
              <CardFooter automation={automation} canManage={canManage} onSeeWhy={() => onAction("seeWhy", automation)} />
            )}
          </div>
          <OwnerAvatar automation={automation} />
        </div>
      </div>
    </article>
  );
};

const PauseSentence: React.FC<{ automation: AutomationSummary }> = ({ automation }) => {
  const t = useTranslations("automations");
  const tList = useTranslations("automationsList");
  const language = useDisplayLanguage();
  const pause = automation.pause!;
  const someone = tList("card.someone");
  const text =
    pause.reason === "MANUAL"
      ? t("pause.MANUAL", { name: pause.by?.name ?? someone, date: formatShortDate(pause.at, { language }) })
      : pause.reason === "TARGET_GONE"
        ? t("pause.TARGET_GONE")
        : t(`pause.${pause.reason}`, { name: automation.owner?.name ?? pause.by?.name ?? someone });
  return <p className="line-clamp-2 text-hint text-secondary">{text}</p>;
};

const CardFooter: React.FC<{ automation: AutomationSummary; canManage: boolean; onSeeWhy: () => void }> = ({
  automation,
  canManage,
  onSeeWhy,
}) => {
  const t = useTranslations("automationsList");
  const language = useDisplayLanguage();
  const when = useWhen();

  let text: React.ReactNode;
  if (automation.status === "ARCHIVED") {
    text = t("card.archived", {
      date: formatShortDate(automation.archivedAt, { language }),
      hasName: automation.archivedBy?.name ? "yes" : "no",
      name: automation.archivedBy?.name ?? "",
      runs: automation.runs,
    });
  } else if (automation.status === "DRAFT") {
    text = automation.updatedAt
      ? t("card.draft", { days: Math.max(0, daysBetween(new Date(automation.updatedAt), new Date())) })
      : t("card.draftUndated");
  } else if (automation.lastRun?.failed) {
    return (
      <p className="flex min-w-0 items-center gap-1.5 text-hint text-status-declined-text">
        <Icon icon={CancelCircleIcon} size="sm" className="shrink-0" />
        <span className="truncate">{t("card.lastRunFailed", { date: formatShortDate(automation.lastRun.at, { language }) })}</span>
        {canManage ? (
          <button
            type="button"
            onClick={onSeeWhy}
            className="relative z-10 shrink-0 text-hint text-status-declined-text underline underline-offset-2 hover:no-underline"
          >
            {t("card.seeWhy")}
          </button>
        ) : null}
      </p>
    );
  } else if (automation.lastRun?.at) {
    text = t("card.lastRun", { when: when(automation.lastRun.at), runs: automation.runs, waiting: automation.waiting });
  } else {
    text = t("card.notRunYet", { waiting: automation.waiting });
  }
  return <p className="truncate text-hint text-tertiary">{text}</p>;
};

const OwnerAvatar: React.FC<{ automation: AutomationSummary }> = ({ automation }) => {
  const t = useTranslations("automationsList");
  const name = automation.owner?.name ?? null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          aria-label={name ? t("card.ownerLabel", { name }) : t("card.noOwner")}
          className="relative z-10 shrink-0 rounded-pill focus-visible:shadow-focus focus-visible:outline-none"
        >
          <PersonAvatar name={name} size={24} />
        </span>
      </TooltipTrigger>
      <TooltipContent title={name ?? t("card.noOwner")}>{name ? t("card.owner") : null}</TooltipContent>
    </Tooltip>
  );
};
