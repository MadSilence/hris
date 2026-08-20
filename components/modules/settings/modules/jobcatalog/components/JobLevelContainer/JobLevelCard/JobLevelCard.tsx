"use client";

import { FC, ReactNode, useState } from "react";
import { ArrowRight, Briefcase, Check, ChevronDown, ChevronUp, Ellipsis, Plus, Users } from "lucide-react";

import { JobLevel, JobLevelGroup } from "@/models/job";
import { Button } from "@/public/desact/src/components/ui/button";
import { Separator } from "@/public/desact/src/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/public/desact/src/components/ui/dropdown-menu";
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
  const [expanded, setExpanded] = useState(false);

  const sortedLevels = [...group.levels].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const hasMore = sortedLevels.length > DEFAULT_VISIBLE;
  // Managing means reordering and deleting, which needs every rung on screen.
  const collapsed = hasMore && !expanded && !managing;
  const visibleLevels = collapsed ? sortedLevels.slice(0, DEFAULT_VISIBLE) : sortedLevels;
  const hiddenCount = sortedLevels.length - DEFAULT_VISIBLE;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-brown-200 bg-white p-6 shadow-sm">
      <header className="flex items-start justify-between gap-3">
        <h3 className="truncate text-lg font-semibold text-foreground">{group.name}</h3>

        <PermissionGate
          anyOf={[
            { resource: "JOBS.LEVEL_GROUP", action: "EDIT" },
            { resource: "JOBS.LEVEL_GROUP", action: "MANAGE" },
          ]}
        >
          {managing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-brown-600 hover:bg-brown-100"
                  aria-label="Group actions"
                >
                  <Ellipsis className="h-4 w-4"/>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <PermissionGate resource="JOBS.LEVEL_GROUP" action="EDIT">
                  <DropdownMenuItem onClick={() => onEditGroup(group)}>Rename</DropdownMenuItem>
                </PermissionGate>

                <PermissionGate resource="JOBS.LEVEL_GROUP" action="MANAGE">
                  <DropdownMenuItem variant="destructive" onClick={() => onDeleteGroup(group)}>
                    Delete
                  </DropdownMenuItem>
                </PermissionGate>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </PermissionGate>
      </header>

      {/* Statistics */}
      <div className="mt-4 flex items-stretch">
        <Stat
          icon={<Users className="h-6 w-6"/>}
          value={String(group.assignedUsersCount)}
          label={group.assignedUsersCount === 1 ? "Employee" : "Employees"}
        />
        <div className="mx-4 w-px bg-brown-200"/>
        <Stat
          icon={<Briefcase className="h-6 w-6"/>}
          value={String(group.assignedJobsCount)}
          label={group.assignedJobsCount === 1 ? "Position" : "Positions"}
        />
      </div>

      <Separator className="my-5"/>

      {/* Levels — vertical career progression */}
      <div className="flex-1">
        {sortedLevels.length === 0 && !managing ? (
          <div className="flex w-full items-center justify-center rounded-md border border-dashed border-brown-300 bg-brown-50/60 px-3 py-2 text-sm text-brown-600">
            No levels yet
          </div>
        ) : (
          <ol>
            {visibleLevels.map((level, index) => {
              const connectorBelow = index < visibleLevels.length - 1 || collapsed;

              return (
                <li key={level.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-brown-400 bg-white"/>
                    {connectorBelow && (
                      <span className="my-1 w-px flex-1 bg-brown-200"/>
                    )}
                  </div>

                  <div className={`flex min-w-0 flex-1 items-center gap-2 ${connectorBelow ? "pb-4" : ""}`}>
                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
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
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-brown-300 bg-brown-50"/>
                </div>

                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  className="rounded-md bg-brown-50 px-2 py-1 text-sm font-medium text-brown-600 transition-colors hover:bg-brown-100"
                >
                  +{hiddenCount} more levels
                </button>
              </li>
            )}
          </ol>
        )}

        {expanded && hasMore && !managing && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="mt-3 text-sm font-medium text-brown-600 transition-colors hover:text-brown-700"
          >
            Show less
          </button>
        )}

        {managing && (
          <PermissionGate resource="JOBS.LEVEL" action="EDIT">
            <button
              type="button"
              className="mt-2 flex w-full items-center gap-1.5 rounded-md border border-dashed border-brown-300 px-3 py-2 text-sm text-brown-600 hover:bg-brown-50"
              onClick={() => onCreateLevel(group)}
            >
              <Plus className="h-4 w-4"/>
              Add Level
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
        <Button
          variant="ghost"
          className="group mt-1 w-full justify-between px-2 text-brown-600 hover:bg-brown-50 hover:text-brown-700"
          onClick={onToggleManaging}
        >
          <span className="text-sm font-medium">{managing ? "Done" : "Manage Group"}</span>
          {managing ? (
            <Check className="h-4 w-4"/>
          ) : (
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5"/>
          )}
        </Button>
      </PermissionGate>
    </article>
  );
};

const Stat = ({ icon, value, label }: { icon: ReactNode; value: string; label: string }) => (
  <div className="flex flex-1 items-center gap-3">
    <span className="text-brown-400">{icon}</span>
    <div>
      <p className="text-xl font-semibold leading-none text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
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
}) => (
  <div className="flex shrink-0 items-center">
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 text-brown-500 hover:bg-brown-100"
      aria-label="Move level up"
      disabled={first || disabled}
      onClick={onUp}
    >
      <ChevronUp className="h-4 w-4"/>
    </Button>

    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 text-brown-500 hover:bg-brown-100"
      aria-label="Move level down"
      disabled={last || disabled}
      onClick={onDown}
    >
      <ChevronDown className="h-4 w-4"/>
    </Button>

    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-brown-500 hover:bg-brown-100"
          aria-label="Level actions"
        >
          <Ellipsis className="h-4 w-4"/>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <PermissionGate resource="JOBS.LEVEL" action="EDIT">
          <DropdownMenuItem onClick={onEdit}>Rename</DropdownMenuItem>
        </PermissionGate>

        <PermissionGate resource="JOBS.LEVEL" action="MANAGE">
          <DropdownMenuItem variant="destructive" onClick={onDelete}>
            Delete
          </DropdownMenuItem>
        </PermissionGate>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);
