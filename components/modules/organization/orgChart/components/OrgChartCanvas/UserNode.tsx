"use client";

import React from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { ChevronUp } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/public/desact/src/components/ui/avatar";
import { cn } from "@/public/desact/src/components/ui/utils";
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
  const { onToggleCollapse, dropTargetId } = useOrgChartCanvas();

  const hasChildren = childCount > 0;
  const isActive = user.status === "ACTIVE";
  const name = fullName(user);
  const isDropTarget = dropTargetId === user.id;

  return (
    <div
      className={cn(
        "relative flex h-[132px] w-[240px] flex-col rounded-xl border bg-white p-3.5 transition-shadow",
        selected
          ? "border-brown-300 bg-brown-100 shadow-md ring-1 ring-brown-200"
          : "border-brown-200 shadow-sm hover:border-brown-300 hover:shadow-md",
        isDropTarget && "border-green-400 ring-2 ring-green-300",
      )}
    >
      <Handle type="target" position={Position.Top} className={hiddenHandle} isConnectable={false} />

      {/* Identity */}
      <div className="flex flex-none items-center gap-2.5">
        <Avatar className="h-10 w-10 flex-none">
          {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={name} /> : null}
          <AvatarFallback className="text-xs">{initials(user)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-snug text-brown-900" title={name}>
            {name}
          </p>
          <p className="truncate text-xs text-brown-500" title={user.jobName ?? undefined}>
            {user.jobName || "—"}
          </p>
        </div>
      </div>

      {/* Department */}
      <div className="mt-2.5 flex-1 overflow-hidden">
        {user.department ? (
          <span className="inline-block max-w-full truncate rounded border border-brown-200 bg-brown-50 px-1.5 py-0.5 text-[11px] leading-none text-brown-600">
            {user.department.name}
          </span>
        ) : null}
      </div>

      {/* Footer: status + reports */}
      <div
        className={cn(
          "flex flex-none items-center justify-between gap-2 border-t pt-2 text-[11px] leading-none",
          selected ? "border-brown-300" : "border-brown-100",
        )}
      >
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-medium",
            isActive ? "bg-green-50 text-green-700" : "bg-brown-100 text-brown-500",
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", isActive ? "bg-green-500" : "bg-brown-400")} />
          {isActive ? "Active" : "Suspended"}
        </span>

        {hasChildren ? (
          <span className="text-brown-500">
            <span className="font-semibold text-brown-700">{childCount}</span> reports
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
          className="nodrag absolute -bottom-3 left-1/2 z-10 flex h-6 min-w-6 -translate-x-1/2 items-center justify-center rounded-full border border-brown-200 bg-white px-1.5 text-brown-500 shadow-sm transition-colors hover:border-brown-300 hover:text-brown-800"
          aria-label={collapsed ? `Expand ${childCount} reports` : "Collapse"}
          title={collapsed ? `Expand ${childCount} reports` : "Collapse"}
        >
          {collapsed ? (
            <span className="text-[11px] font-semibold leading-none">{childCount}</span>
          ) : (
            <ChevronUp className="h-3.5 w-3.5" />
          )}
        </button>
      )}
    </div>
  );
}
