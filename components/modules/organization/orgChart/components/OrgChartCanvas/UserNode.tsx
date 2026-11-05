"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/desact/avatar";
import { cn } from "@/lib/cn";
import type { OrgChartUser } from "@/models/orgChart/OrgChartUser";

import { useOrgChartCanvas } from "./OrgChartCanvasContext";

export const NODE_W = 240;
export const NODE_H = 132;

export type UserNodeData = {
  user: OrgChartUser;
  childCount: number;
  collapsed: boolean;
  selected: boolean;
};

export type UserFlowNode = Node<UserNodeData, "user">;

const hiddenHandle = "!h-1.5 !w-1.5 !min-w-0 !border-0 !bg-transparent";

function fullName(u: OrgChartUser): string {
  return `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email;
}

function initials(u: OrgChartUser): string {
  const a = (u.firstName ?? "").trim();
  const b = (u.lastName ?? "").trim();
  const fromParts = (a ? a[0] : "") + (b ? b[0] : "");
  if (fromParts) return fromParts.toUpperCase();
  return (u.email ?? "?").slice(0, 2).toUpperCase();
}

export function UserNode({ data }: NodeProps<UserFlowNode>) {
  const { user, childCount, collapsed, selected } = data;
  const t = useTranslations("organization");
  const { onToggleCollapse, dropTargetId } = useOrgChartCanvas();

  const hasChildren = childCount > 0;
  const isActive = user.status === "ACTIVE";
  const name = fullName(user);
  const isDropTarget = dropTargetId === user.id;

  return (
    <div
      className={cn(
        "relative flex h-[132px] w-[240px] flex-col rounded-popover border bg-card p-3.5 transition-shadow",
        selected
          ? "border-accent bg-card shadow-raised ring-1 ring-accent-ring"
          : "border-divider shadow-card hover:border-field hover:shadow-raised",
        isDropTarget && "border-dashed border-accent-ring bg-accent-subtle",
      )}
    >
      <Handle type="target" position={Position.Top} className={hiddenHandle} isConnectable={false} />

      {/* Identity */}
      <div className="flex flex-none items-center gap-2.5">
        <Avatar className="h-10 w-10 flex-none">
          {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={name} /> : null}
          <AvatarFallback className="text-hint">{initials(user)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-body font-semibold leading-snug text-primary" title={name}>
            {name}
          </p>
          <p className="truncate text-hint text-tertiary" title={user.jobName ?? undefined}>
            {user.jobName}
          </p>
        </div>
      </div>

      {/* Department */}
      <div className="mt-2.5 flex-1 overflow-hidden">
        {user.department ? (
          <span className="inline-block max-w-full truncate rounded-tag border border-divider bg-subtle px-1.5 py-0.5 text-hint leading-none text-secondary">
            {user.department.name}
          </span>
        ) : null}
      </div>

      {/* Footer: status + reports */}
      <div
        className={cn(
          "flex flex-none items-center justify-between gap-2 border-t pt-2 text-hint leading-none",
          selected ? "border-accent-ring" : "border-divider",
        )}
      >
        {/* No status when the caller may not see it — "Suspended" would be a claim nobody made. */}
        {user.status ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-pill px-1.5 py-0.5 font-medium",
              isActive ? "bg-status-approved-bg text-status-approved-text" : "bg-mist text-tertiary",
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-pill", isActive ? "bg-status-approved-fill" : "bg-strong")} />
            {isActive ? t("orgChart.status.active") : t("orgChart.status.suspended")}
          </span>
        ) : (
          <span />
        )}

        {hasChildren ? (
          <span className="text-tertiary">
            {t.rich("orgChart.node.reports", {
              count: childCount,
              b: (chunks) => <span className="font-semibold text-secondary">{chunks}</span>,
            })}
          </span>
        ) : null}
      </div>

      <Handle type="source" position={Position.Bottom} className={hiddenHandle} isConnectable={false} />

      {hasChildren && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse(user.id);
          }}
          className="nodrag absolute -bottom-3 left-1/2 z-10 flex h-6 min-w-6 -translate-x-1/2 items-center justify-center rounded-pill border border-divider bg-card px-1.5 text-tertiary shadow-card transition-colors hover:border-field hover:text-primary"
          aria-label={collapsed ? t("orgChart.node.expand", { count: childCount }) : t("orgChart.node.collapse")}
          title={collapsed ? t("orgChart.node.expand", { count: childCount }) : t("orgChart.node.collapse")}
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
