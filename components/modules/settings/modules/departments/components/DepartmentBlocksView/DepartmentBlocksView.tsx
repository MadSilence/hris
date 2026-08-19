"use client";

import "@xyflow/react/dist/style.css";

import React, { useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";

import type { DepartmentPerson, DepartmentTreeNode } from "@/models/departments";
import { useDepartmentBlockFlow } from "@/components/modules/settings/modules/departments/hooks/useDepartmentBlockFlow/useDepartmentBlockFlow";

import { DepartmentBlockNode } from "./DepartmentBlockNode";
import { CompanyBlockNode } from "./CompanyBlockNode";
import {
  DepartmentBlocksProvider,
  type DepartmentBlocksHandlers,
} from "./DepartmentBlocksContext";

const nodeTypes = { unitBlock: DepartmentBlockNode, companyBlock: CompanyBlockNode };

type Props = {
  tree: DepartmentTreeNode[];
  peopleByDepartment: Map<string, DepartmentPerson[]>;
  company: { name: string; logo: string | null; peopleAssigned: number };
  collapsed: Set<string>;
  expanded: Set<string>;
  selectedId: string | null;
  matchedIds?: Set<string>;
  searchActive?: boolean;
  handlers: DepartmentBlocksHandlers;
  /** Rendered over the canvas — the drag hint in edit mode, for instance. */
  banner?: React.ReactNode;
};

function DepartmentBlocksInner({
  tree,
  peopleByDepartment,
  company,
  collapsed,
  expanded,
  selectedId,
  matchedIds,
  searchActive,
  handlers,
  banner,
}: Props) {
  const { nodes, edges } = useDepartmentBlockFlow({
    tree,
    peopleByDepartment,
    company,
    collapsed,
    expanded,
    selectedId,
    matchedIds,
    searchActive,
  });

  const value = useMemo(() => handlers, [handlers]);

  return (
    <DepartmentBlocksProvider value={value}>
      {banner}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesFocusable={false}
        // React Flow drops pointer-events on nodes that can neither be selected nor dragged, which
        // would make the chips inside a block unclickable and undraggable.
        elementsSelectable
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
        minZoom={0.15}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        className="bg-transparent"
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.5} color="var(--brown-200)" />
        <Controls showInteractive={false} className="!rounded-lg !border !border-brown-200 !bg-white !shadow-sm" />
      </ReactFlow>
    </DepartmentBlocksProvider>
  );
}

export function DepartmentBlocksView(props: Props) {
  return (
    <ReactFlowProvider>
      <DepartmentBlocksInner {...props} />
    </ReactFlowProvider>
  );
}
