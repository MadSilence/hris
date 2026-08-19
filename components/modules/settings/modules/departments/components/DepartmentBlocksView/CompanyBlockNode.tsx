"use client";

import React from "react";
import Image from "next/image";
import { Building2 } from "lucide-react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

import { cn } from "@/public/desact/src/components/ui/utils";

import { BLOCK_W } from "./DepartmentBlockNode";

export const COMPANY_BLOCK_ID = "__company_block__";
export const COMPANY_BLOCK_H = 84;

export type CompanyBlockNodeData = {
  name: string;
  logo: string | null;
  peopleAssigned: number;
  departmentCount: number;
  dimmed: boolean;
};

export type CompanyBlockFlowNode = Node<CompanyBlockNodeData, "companyBlock">;

const hiddenHandle = "!h-1.5 !w-1.5 !min-w-0 !border-0 !bg-transparent";

/** The root of the block tree: the same anchor the chart view has, so the structure reads whole. */
export function CompanyBlockNode({ data }: NodeProps<CompanyBlockFlowNode>) {
  const { name, logo, peopleAssigned, departmentCount, dimmed } = data;

  return (
    <div
      style={{ width: BLOCK_W, height: COMPANY_BLOCK_H }}
      className={cn(
        "nopan flex items-center gap-3 rounded-xl border border-brown-200 bg-white px-4 shadow-sm",
        dimmed && "opacity-35",
      )}
    >
      <div className="flex h-10 w-10 flex-none items-center justify-center overflow-hidden rounded-lg bg-brown-100 text-brown-600">
        {logo ? (
          <Image src={logo} alt="" width={40} height={40} className="h-full w-full object-cover" />
        ) : (
          <Building2 className="h-5 w-5" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-brown-900">{name}</p>
        <p className="mt-0.5 text-[11px] text-brown-500">
          <span className="font-semibold text-brown-700">{peopleAssigned}</span>{" "}
          {peopleAssigned === 1 ? "person" : "people"} ·{" "}
          <span className="font-semibold text-brown-700">{departmentCount}</span>{" "}
          {departmentCount === 1 ? "department" : "departments"}
        </p>
      </div>

      <Handle type="source" position={Position.Bottom} className={hiddenHandle} isConnectable={false} />
    </div>
  );
}
