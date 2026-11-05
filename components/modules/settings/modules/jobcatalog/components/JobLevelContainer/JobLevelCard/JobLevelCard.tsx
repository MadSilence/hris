"use client";

import { useTranslations } from "next-intl";
import { FC, ReactNode, useState } from "react";
import { Add01Icon, ArrowDown01Icon, ArrowRight02Icon, ArrowUp01Icon, Briefcase01Icon, Delete02Icon, PencilEdit02Icon, Tick02Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { JobLevel, JobLevelGroup } from "@/models/job";
import { Button } from "@/components/desact/button";
import { Separator } from "@/components/desact/separator";
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { PermissionGate } from "@/components/auth/PermissionGate";

type Props = {
  group: JobLevelGroup;
  /** Only one card is in manage mode at a time — two open toolbars made ownership unclear. */
  managing: boolean;
  onToggleManaging: () => void;
  onEditGroup: (group: JobLevelGroup) => void;
  onDeleteGroup: (group: JobLevelGroup) => void;
  onCreateLevel: (group: JobLevelGroup) => void;
  onEditLevel: (group: JobLevelGroup, level: JobLevel) => void;
  onDeleteLevel: (group: JobLevelGroup, level: JobLevel) => void;
  onMoveLevel: (group: JobLevelGroup, level: JobLevel, direction: -1 | 1) => void;
  isReordering?: boolean;
};

const DEFAULT_VISIBLE = 4;

export const JobLevelCard: FC<Props> = ({
  group,
  managing,
  onToggleManaging,
  onEditGroup,
  onDeleteGroup,
  onCreateLevel,
  onEditLevel,
  onDeleteLevel,
  onMoveLevel,
  isReordering = false,
}) => {
  const t = useTranslations("structure.jobLevels");
  const tCommon = useTranslations("common");
  const [expanded, setExpanded] = useState(false);

  const sortedLevels = [...group.levels].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const hasMore = sortedLevels.length > DEFAULT_VISIBLE;
  // Managing means reordering and deleting, which needs every rung on screen.
  const collapsed = hasMore && !expanded && !managing;
  const visibleLevels = collapsed ? sortedLevels.slice(0, DEFAULT_VISIBLE) : sortedLevels;
  const hiddenCount = sortedLevels.length - DEFAULT_VISIBLE;

  return (
    <article className="flex h-full flex-col rounded-card border border-divider bg-card p-6 shadow-card">
      <header className="flex items-start justify-between gap-3">
        <h3 className="truncate text-section-title text-primary">{group.name}</h3>

        <PermissionGate
          anyOf={[
            { resource: "JOBS.LEVEL_GROUP", action: "EDIT" },
            { resource: "JOBS.LEVEL_GROUP", action: "MANAGE" },
          ]}
        >
          {managing && (
            <RowActionsMenu label={t("card.trackActions")}>
              <PermissionGate resource="JOBS.LEVEL_GROUP" action="EDIT">
                <RowAction icon={<Icon icon={PencilEdit02Icon} size="sm" />} onClick={() => onEditGroup(group)}>
                  {tCommon("actions.rename")}
                </RowAction>
              </PermissionGate>

              <PermissionGate resource="JOBS.LEVEL_GROUP" action="MANAGE">
                <RowActionDestructive
                  icon={<Icon icon={Delete02Icon} size="sm" />}
                  onClick={() => onDeleteGroup(group)}
                >
                  {tCommon("actions.delete")}
                </RowActionDestructive>
              </PermissionGate>
            </RowActionsMenu>
          )}
        </PermissionGate>
      </header>

      {/* Statistics */}
      <div className="mt-4 flex items-stretch">
        <Stat
          icon={<Icon icon={UserGroupIcon} size="lg" />}
          value={String(group.assignedUsersCount)}
          label={t("card.employees", { count: group.assignedUsersCount })}
        />
        <div className="mx-4 w-px bg-divider"/>
        <Stat
          icon={<Icon icon={Briefcase01Icon} size="lg" />}
          value={String(group.assignedJobsCount)}
          label={t("card.positions", { count: group.assignedJobsCount })}
        />
      </div>

      <Separator className="my-5"/>

      {/* Levels — vertical career progression */}
      <div className="flex-1">
        {sortedLevels.length === 0 && !managing ? (
          <div className="flex w-full items-center justify-center rounded-control border border-dashed border-field bg-subtle/60 px-3 py-2 text-body text-secondary">
            {t("card.noLevels")}
          </div>
        ) : (
          <ol>
            {visibleLevels.map((level, index) => {
              const connectorBelow = index < visibleLevels.length - 1 || collapsed;

              return (
                <li key={level.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-pill border-2 border-strong bg-card"/>
                    {connectorBelow && (
                      <span className="my-1 w-px flex-1 bg-divider"/>
                    )}
                  </div>

                  <div className={`flex min-w-0 flex-1 items-center gap-2 ${connectorBelow ? "pb-4" : ""}`}>
                    <p className="min-w-0 flex-1 truncate text-body font-medium text-primary">
                      {level.name}
                    </p>

                    {managing && (
                      <LevelActions
                        first={index === 0}
                        last={index === visibleLevels.length - 1}
                        disabled={isReordering}
                        onUp={() => onMoveLevel(group, level, -1)}
                        onDown={() => onMoveLevel(group, level, 1)}
                        onEdit={() => onEditLevel(group, level)}
                        onDelete={() => onDeleteLevel(group, level)}
                      />
                    )}
                  </div>
                </li>
              );
            })}

            {collapsed && (
              <li className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-pill border-2 border-field bg-subtle"/>
                </div>

                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  className="rounded-control bg-subtle px-2 py-1 text-body font-medium text-secondary transition-colors hover:bg-mist"
                >
                  {t("card.moreLevels", { count: hiddenCount })}
                </button>
              </li>
            )}
          </ol>
        )}

        {expanded && hasMore && !managing && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="mt-3 text-body font-medium text-secondary transition-colors hover:text-secondary"
          >
            {tCommon("actions.showLess")}
          </button>
        )}

        {managing && (
          <PermissionGate resource="JOBS.LEVEL" action="EDIT">
            <button
              type="button"
              className="mt-2 flex w-full items-center gap-1.5 rounded-control border border-dashed border-field px-3 py-2 text-body text-secondary hover:bg-subtle"
              onClick={() => onCreateLevel(group)}
            >
              <Icon icon={Add01Icon} size="sm" />
              {t("addLevel")}
            </button>
          </PermissionGate>
        )}
      </div>

      {/* Footer action */}
      <Separator className="mt-5"/>
      <PermissionGate
        anyOf={[
          { resource: "JOBS.LEVEL_GROUP", action: "EDIT" },
          { resource: "JOBS.LEVEL", action: "EDIT" },
        ]}
      >
        <Button type="button"
          variant="ghost"
          className="group mt-1 w-full justify-between px-2 text-secondary hover:bg-subtle hover:text-secondary"
          onClick={onToggleManaging}
        >
          <span className="text-body font-medium">{managing ? tCommon("actions.done") : t("card.manage")}</span>
          {managing ? (
            <Icon icon={Tick02Icon} size="sm" />
          ) : (
            <Icon icon={ArrowRight02Icon} size="sm" className="transition-transform group-hover:translate-x-0.5" />
          )}
        </Button>
      </PermissionGate>
    </article>
  );
};

const Stat = ({ icon, value, label }: { icon: ReactNode; value: string; label: string }) => (
  <div className="flex flex-1 items-center gap-3">
    <span className="text-tertiary">{icon}</span>
    <div>
      <p className="text-section-title leading-none text-primary">{value}</p>
      <p className="mt-1 text-hint text-tertiary">{label}</p>
    </div>
  </div>
);

type LevelActionsProps = {
  first: boolean;
  last: boolean;
  disabled: boolean;
  onUp: () => void;
  onDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

/**
 * Up/down rather than drag: the ladder is short, the whole order is rewritten server-side on every
 * move, and arrows work the same on touch.
 */
const LevelActions: FC<LevelActionsProps> = ({
  first,
  last,
  disabled,
  onUp,
  onDown,
  onEdit,
  onDelete,
}) => {
  const t = useTranslations("structure.jobLevels");
  const tCommon = useTranslations("common");
  return (
  <div className="flex shrink-0 items-center">
    <Button type="button"
      variant="ghost"
      size="icon"
      className="h-7 w-7 text-tertiary hover:bg-mist"
      aria-label={t("card.moveUp")}
      disabled={first || disabled}
      onClick={onUp}
    >
      <Icon icon={ArrowUp01Icon} size="sm" />
    </Button>

    <Button type="button"
      variant="ghost"
      size="icon"
      className="h-7 w-7 text-tertiary hover:bg-mist"
      aria-label={t("card.moveDown")}
      disabled={last || disabled}
      onClick={onDown}
    >
      <Icon icon={ArrowDown01Icon} size="sm" />
    </Button>

    <RowActionsMenu label={t("card.levelActions")}>
        <PermissionGate resource="JOBS.LEVEL" action="EDIT">
          <RowAction icon={<Icon icon={PencilEdit02Icon} size="sm" />} onClick={onEdit}>
            {tCommon("actions.rename")}
          </RowAction>
        </PermissionGate>

        <PermissionGate resource="JOBS.LEVEL" action="MANAGE">
          <RowActionDestructive icon={<Icon icon={Delete02Icon} size="sm" />} onClick={onDelete}>
            {tCommon("actions.delete")}
          </RowActionDestructive>
        </PermissionGate>
    </RowActionsMenu>
  </div>
  );
};
