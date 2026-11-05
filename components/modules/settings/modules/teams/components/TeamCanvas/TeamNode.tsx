"use client";

import { useTranslations } from "next-intl";
import React from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { ArrowUp01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import type { TeamTreeNode } from "@/models/teams";
import { cn } from "@/lib/cn";

import { useTeamCanvas } from "./TeamCanvasContext";
import { StatusBadge } from "@/components/ui/StatusBadge";

export const NODE_W = 200;
export const NODE_H = 140;

export type TeamNodeData = {
  team: TeamTreeNode;
  childCount: number;
  collapsed: boolean;
  selected: boolean;
  matched?: boolean;
  dimmed?: boolean;
};

export type TeamFlowNode = Node<TeamNodeData, "team">;

const hiddenHandle = "!h-1.5 !w-1.5 !min-w-0 !border-0 !bg-transparent";

export function TeamNode({ data }: NodeProps<TeamFlowNode>) {
  const { team, childCount, collapsed, selected, matched, dimmed } = data;
  const { onToggleCollapse, dropTargetId } = useTeamCanvas();
  const t = useTranslations("structure.teams");
  const tShared = useTranslations("structure.shared");

  const isArchived = team.status === "ARCHIVED";
  const hasChildren = childCount > 0;
  const isDropTarget = dropTargetId === team.id;

  return (
    <div
      className={cn(
        "relative flex h-[140px] w-[200px] flex-col rounded-popover border bg-card p-3.5 transition-shadow",
        selected
          ? "border-accent bg-card shadow-raised ring-1 ring-accent-ring"
          : "border-divider shadow-card hover:border-field hover:shadow-raised",
        isArchived && "border-dashed",
        matched && "bg-search-highlight ring-2 ring-strong",
        dimmed && "opacity-35",
        isDropTarget && "border-dashed border-accent-ring bg-accent-subtle",
      )}
    >
      <Handle type="target" position={Position.Top} className={hiddenHandle} isConnectable={false} />

      {/* Top row: team icon (left) + code (right) */}
      <div className="flex flex-none items-center justify-between">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-control",
            selected ? "bg-accent-muted text-accent-text" : "bg-mist text-secondary",
          )}
        >
          <Icon icon={UserGroupIcon} size="sm" />
        </div>

        {team.code && (
          <span className="rounded-tag border border-divider bg-subtle px-1 py-0.5 font-mono text-hint leading-none text-tertiary">
            {team.code}
          </span>
        )}
      </div>

      {/* Name */}
      <div className="mt-2.5 flex-1 overflow-hidden">
        <p className="line-clamp-2 text-body font-semibold leading-snug text-primary" title={team.name}>
          {team.name}
        </p>
        {isArchived && (
          <StatusBadge status="archived" className="mt-1 inline-block px-1 py-0.5 text-hint leading-none" />
        )}
      </div>

      {/* Footer: Members + Subs */}
      <div
        className={cn(
          "flex flex-none items-center gap-4 border-t pt-2 text-hint leading-none text-tertiary",
          selected ? "border-accent-ring" : "border-divider",
        )}
      >
        <span>{tShared.rich("nodePeople", { count: team.memberCount, b: (chunks) => <span className="font-semibold text-secondary">{chunks}</span> })}</span>
        <span>{tShared.rich("nodeSubs", { count: childCount, b: (chunks) => <span className="font-semibold text-secondary">{chunks}</span> })}</span>
      </div>

      <Handle type="source" position={Position.Bottom} className={hiddenHandle} isConnectable={false} />

      {hasChildren && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse(team.id);
          }}
          className="nodrag absolute -bottom-3 left-1/2 z-10 flex h-6 min-w-6 -translate-x-1/2 items-center justify-center rounded-pill border border-divider bg-card px-1.5 text-tertiary shadow-card transition-colors hover:border-field hover:text-primary"
          aria-label={collapsed ? t("expandSub", { count: childCount }) : tShared("collapse")}
          title={collapsed ? t("expandSub", { count: childCount }) : tShared("collapse")}
        >
          {collapsed ? (
            <span className="text-hint font-semibold leading-none">{childCount}</span>
          ) : (
            <Icon icon={ArrowUp01Icon} size="sm" />
          )}
        </button>
      )}
    </div>
  );
}
