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

import type { TeamPerson, TeamTreeNode } from "@/models/teams";
import { useTeamBlockFlow } from "@/components/modules/settings/modules/teams/hooks/useTeamBlockFlow/useTeamBlockFlow";

import { TeamBlockNode } from "./TeamBlockNode";
import { CompanyBlockNode } from "./CompanyBlockNode";
import {
  TeamBlocksProvider,
  type TeamBlocksHandlers,
} from "./TeamBlocksContext";

const nodeTypes = { unitBlock: TeamBlockNode, companyBlock: CompanyBlockNode };

type Props = {
  tree: TeamTreeNode[];
  peopleByTeam: Map<string, TeamPerson[]>;
  company: { name: string; logo: string | null; peopleAssigned: number };
  collapsed: Set<string>;
  expanded: Set<string>;
  selectedId: string | null;
  matchedIds?: Set<string>;
  searchActive?: boolean;
  handlers: TeamBlocksHandlers;
  /** Rendered over the canvas — the drag hint in edit mode, for instance. */
  banner?: React.ReactNode;
};

function TeamBlocksInner({
  tree,
  peopleByTeam,
  company,
  collapsed,
  expanded,
  selectedId,
  matchedIds,
  searchActive,
  handlers,
  banner,
}: Props) {
  const { nodes, edges } = useTeamBlockFlow({
    tree,
    peopleByTeam,
    company,
    collapsed,
    expanded,
    selectedId,
    matchedIds,
    searchActive,
  });

  const value = useMemo(() => handlers, [handlers]);

  return (
    <TeamBlocksProvider value={value}>
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
    </TeamBlocksProvider>
  );
}

export function TeamBlocksView(props: Props) {
  return (
    <ReactFlowProvider>
      <TeamBlocksInner {...props} />
    </ReactFlowProvider>
  );
}
