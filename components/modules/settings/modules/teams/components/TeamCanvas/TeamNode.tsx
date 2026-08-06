"use client";

import React from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { ChevronUp, Users } from "lucide-react";

import type { TeamTreeNode } from "@/models/teams";
import { cn } from "@/public/desact/src/components/ui/utils";

import { useTeamCanvas } from "./TeamCanvasContext";

export const NODE_W = 200;
export const NODE_H = 140;

export type TeamNodeData = {
  team: TeamTreeNode;
  childCount: number;
  collapsed: boolean;
  selected: boolean;
};

export type TeamFlowNode = Node<TeamNodeData, "team">;

const hiddenHandle = "!h-1.5 !w-1.5 !min-w-0 !border-0 !bg-transparent";

export function TeamNode({ data }: NodeProps<TeamFlowNode>) {
  const { team, childCount, collapsed, selected } = data;
  const { onToggleCollapse } = useTeamCanvas();

  const isArchived = team.status === "ARCHIVED";
  const hasChildren = childCount > 0;

  return (
    <div
      className={cn(
        "relative flex h-[140px] w-[200px] flex-col rounded-xl border bg-white p-3.5 transition-shadow",
        selected
          ? "border-brown-300 bg-brown-100 shadow-md ring-1 ring-brown-200"
          : "border-brown-200 shadow-sm hover:border-brown-300 hover:shadow-md",
        isArchived && "border-dashed opacity-50",
      )}
    >
      <Handle type="target" position={Position.Top} className={hiddenHandle} isConnectable={false} />

      {/* Top row: team icon (left) + code (right) */}
      <div className="flex flex-none items-center justify-between">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            selected ? "bg-brown-200 text-brown-700" : "bg-brown-100 text-brown-600",
          )}
        >
          <Users className="h-4 w-4" />
        </div>

        {team.code && (
          <span className="rounded border border-brown-200 bg-brown-50 px-1 py-0.5 font-mono text-[10px] leading-none text-brown-500">
            {team.code}
          </span>
        )}
      </div>

      {/* Name */}
      <div className="mt-2.5 flex-1 overflow-hidden">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-brown-900" title={team.name}>
          {team.name}
        </p>
        {isArchived && (
          <span className="mt-1 inline-block rounded bg-brown-100 px-1 py-0.5 text-[10px] leading-none text-brown-500">
            Archived
          </span>
        )}
      </div>

      {/* Footer: Members + Subs */}
      <div
        className={cn(
          "flex flex-none items-center gap-4 border-t pt-2 text-[11px] leading-none text-brown-500",
          selected ? "border-brown-300" : "border-brown-100",
        )}
      >
        <span>
          <span className="font-semibold text-brown-700">{team.memberCount}</span> People
        </span>
        <span>
          <span className="font-semibold text-brown-700">{childCount}</span> Subs
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className={hiddenHandle} isConnectable={false} />

      {hasChildren && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse(team.id);
          }}
          className="nodrag absolute -bottom-3 left-1/2 z-10 flex h-6 min-w-6 -translate-x-1/2 items-center justify-center rounded-full border border-brown-200 bg-white px-1.5 text-brown-500 shadow-sm transition-colors hover:border-brown-300 hover:text-brown-800"
          aria-label={collapsed ? `Expand ${childCount} sub-teams` : "Collapse"}
          title={collapsed ? `Expand ${childCount} sub-teams` : "Collapse"}
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
