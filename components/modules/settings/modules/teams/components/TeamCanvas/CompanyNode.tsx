"use client";

import { useTranslations } from "next-intl";
import React from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { ArrowUp01Icon, Building03Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { cn } from "@/lib/cn";

import { useTeamCanvas } from "./TeamCanvasContext";

export const COMPANY_NODE_ID = "__company_root__";

export type CompanyNodeData = {
  name: string;
  logo: string | null;
  memberCount: number;
  teamCount: number;
  collapsed: boolean;
  selected: boolean;
  dimmed?: boolean;
};

export type CompanyFlowNode = Node<CompanyNodeData, "company">;

const hiddenHandle = "!h-1.5 !w-1.5 !min-w-0 !border-0 !bg-transparent";

export function CompanyNode({ data }: NodeProps<CompanyFlowNode>) {
  const { name, logo, memberCount, teamCount, collapsed, selected, dimmed } = data;
  const { onToggleCollapse, dropTargetId } = useTeamCanvas();
  const t = useTranslations("structure.teams");
  const tShared = useTranslations("structure.shared");

  const hasChildren = teamCount > 0;

  return (
    <div
      className={cn(
        "relative flex h-[140px] w-[200px] flex-col rounded-popover border bg-card p-3.5 transition-shadow",
        selected
          ? "border-accent bg-card shadow-raised ring-1 ring-accent-ring"
          : "border-divider shadow-card hover:border-field hover:shadow-raised",
        dimmed && "opacity-35",
        dropTargetId === COMPANY_NODE_ID && "border-dashed border-accent-ring bg-accent-subtle",
      )}
    >
      <div className="flex flex-none items-center">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center overflow-hidden rounded-control",
            selected ? "bg-accent-muted text-accent-text" : "bg-mist text-secondary",
          )}
        >
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" className="h-full w-full object-cover" />
          ) : (
            <Icon icon={Building03Icon} size="sm" />
          )}
        </div>
      </div>

      <div className="mt-2.5 flex-1 overflow-hidden">
        <p className="line-clamp-2 text-body font-semibold leading-snug text-primary" title={name}>
          {name}
        </p>
      </div>

      <div
        className={cn(
          "flex flex-none items-center gap-4 border-t pt-2 text-hint leading-none text-tertiary",
          selected ? "border-accent-ring" : "border-divider",
        )}
      >
        <span>{tShared.rich("nodePeople", { count: memberCount, b: (chunks) => <span className="font-semibold text-secondary">{chunks}</span> })}</span>
        <span>{tShared.rich("nodeSubsAll", { count: teamCount, b: (chunks) => <span className="font-semibold text-secondary">{chunks}</span> })}</span>
      </div>

      <Handle type="source" position={Position.Bottom} className={hiddenHandle} isConnectable={false} />

      {hasChildren && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse(COMPANY_NODE_ID);
          }}
          className="nodrag absolute -bottom-3 left-1/2 z-10 flex h-6 min-w-6 -translate-x-1/2 items-center justify-center rounded-pill border border-divider bg-card px-1.5 text-tertiary shadow-card transition-colors hover:border-field hover:text-primary"
          aria-label={collapsed ? t("expandTop", { count: teamCount }) : tShared("collapse")}
          title={collapsed ? t("expandTop", { count: teamCount }) : tShared("collapse")}
        >
          {collapsed ? (
            <span className="text-hint font-semibold leading-none">{teamCount}</span>
          ) : (
            <Icon icon={ArrowUp01Icon} size="sm" />
          )}
        </button>
      )}
    </div>
  );
}
