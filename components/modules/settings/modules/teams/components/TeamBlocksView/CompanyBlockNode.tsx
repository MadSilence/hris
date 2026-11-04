"use client";

import React from "react";
import Image from "next/image";
import { Building03Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

import { cn } from "@/lib/cn";

import { BLOCK_W } from "./TeamBlockNode";

export const COMPANY_BLOCK_ID = "__company_block__";
export const COMPANY_BLOCK_H = 84;

export type CompanyBlockNodeData = {
  name: string;
  logo: string | null;
  peopleAssigned: number;
  teamCount: number;
  dimmed: boolean;
};

export type CompanyBlockFlowNode = Node<CompanyBlockNodeData, "companyBlock">;

const hiddenHandle = "!h-1.5 !w-1.5 !min-w-0 !border-0 !bg-transparent";

/** The root of the block tree: the same anchor the chart view has, so the structure reads whole. */
export function CompanyBlockNode({ data }: NodeProps<CompanyBlockFlowNode>) {
  const { name, logo, peopleAssigned, teamCount, dimmed } = data;

  return (
    <div
      style={{ width: BLOCK_W, height: COMPANY_BLOCK_H }}
      className={cn(
        "nopan flex items-center gap-3 rounded-card border border-divider bg-card px-4 shadow-card",
        dimmed && "opacity-35",
      )}
    >
      <div className="flex h-10 w-10 flex-none items-center justify-center overflow-hidden rounded-control bg-mist text-secondary">
        {logo ? (
          <Image src={logo} alt="" width={40} height={40} className="h-full w-full object-cover" />
        ) : (
          <Icon icon={Building03Icon} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-semibold text-primary">{name}</p>
        <p className="mt-0.5 text-hint text-tertiary">
          <span className="font-semibold text-secondary">{peopleAssigned}</span>{" "}
          {peopleAssigned === 1 ? "person" : "people"} ·{" "}
          <span className="font-semibold text-secondary">{teamCount}</span>{" "}
          {teamCount === 1 ? "team" : "teams"}
        </p>
      </div>

      <Handle type="source" position={Position.Bottom} className={hiddenHandle} isConnectable={false} />
    </div>
  );
}
