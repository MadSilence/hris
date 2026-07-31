"use client";

import React from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Building2, ChevronUp } from "lucide-react";

import { cn } from "@/public/desact/src/components/ui/utils";

import { useTeamCanvas } from "./TeamCanvasContext";

export const COMPANY_NODE_ID = "__company_root__";

export type CompanyNodeData = {
  name: string;
  logo: string | null;
  memberCount: number;
  teamCount: number;
  collapsed: boolean;
  selected: boolean;
};

export type CompanyFlowNode = Node<CompanyNodeData, "company">;

const hiddenHandle = "!h-1.5 !w-1.5 !min-w-0 !border-0 !bg-transparent";

export function CompanyNode({ data }: NodeProps<CompanyFlowNode>) {
  const { name, logo, memberCount, teamCount, collapsed, selected } = data;
  const { onToggleCollapse } = useTeamCanvas();

  const hasChildren = teamCount > 0;

  return (
    <div
      className={cn(
        "relative flex h-[140px] w-[200px] flex-col rounded-xl border bg-white p-3.5 transition-shadow",
        selected
          ? "border-brown-300 bg-brown-100 shadow-md ring-1 ring-brown-200"
          : "border-brown-200 shadow-sm hover:border-brown-300 hover:shadow-md",
      )}
    >
      <div className="flex flex-none items-center">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg",
            selected ? "bg-brown-200 text-brown-700" : "bg-brown-100 text-brown-600",
          )}
        >
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" className="h-full w-full object-cover" />
          ) : (
            <Building2 className="h-4 w-4" />
          )}
        </div>
      </div>

      <div className="mt-2.5 flex-1 overflow-hidden">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-brown-900" title={name}>
          {name}
        </p>
      </div>

      <div
        className={cn(
          "flex flex-none items-center gap-4 border-t pt-2 text-[11px] leading-none text-brown-500",
          selected ? "border-brown-300" : "border-brown-100",
        )}
      >
        <span>
          <span className="font-semibold text-brown-700">{memberCount}</span> Members
        </span>
        <span>
          <span className="font-semibold text-brown-700">{teamCount}</span> Subs
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className={hiddenHandle} isConnectable={false} />

      {hasChildren && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse(COMPANY_NODE_ID);
          }}
          className="nodrag absolute -bottom-3 left-1/2 z-10 flex h-6 min-w-6 -translate-x-1/2 items-center justify-center rounded-full border border-brown-200 bg-white px-1.5 text-brown-500 shadow-sm transition-colors hover:border-brown-300 hover:text-brown-800"
          aria-label={collapsed ? `Expand ${teamCount} teams` : "Collapse"}
          title={collapsed ? `Expand ${teamCount} teams` : "Collapse"}
        >
          {collapsed ? (
            <span className="text-[11px] font-semibold leading-none">{teamCount}</span>
          ) : (
            <ChevronUp className="h-3.5 w-3.5" />
          )}
        </button>
      )}
    </div>
  );
}
