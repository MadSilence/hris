"use client";

import "@xyflow/react/dist/style.css";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type NodeMouseHandler,
} from "@xyflow/react";

import type { DepartmentTreeNode } from "@/models/departments";
import { useDepartmentFlow, type OrgFlowNode } from "@/components/modules/settings/modules/departments/hooks/useDepartmentFlow/useDepartmentFlow";

import { DepartmentNode, NODE_H, NODE_W } from "./DepartmentNode";
import { CompanyNode, COMPANY_NODE_ID } from "./CompanyNode";
import {
  DepartmentCanvasProvider,
  type DepartmentCanvasHandlers,
} from "./DepartmentCanvasContext";

const nodeTypes = { department: DepartmentNode, company: CompanyNode };

type Props = DepartmentCanvasHandlers & {
  tree: DepartmentTreeNode[];
  company: { name: string; logo: string | null; memberCount: number };
  collapsed: Set<string>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  recenterSignal: number;
};

function DepartmentCanvasInner({
  tree,
  company,
  collapsed,
  selectedId,
  onSelect,
  onToggleCollapse,
  recenterSignal,
}: Props) {
  const { nodes, edges } = useDepartmentFlow({ tree, company, collapsed, selectedId });
  const { setCenter, getZoom } = useReactFlow();

  const centerOnNode = useCallback(
    (x: number, y: number) => {
      setCenter(x + NODE_W / 2, y + NODE_H / 2, { zoom: getZoom(), duration: 450 });
    },
    [setCenter, getZoom],
  );

  const handleNodeClick: NodeMouseHandler<OrgFlowNode> = useCallback(
    (_event, node) => {
      onSelect(node.id);
      centerOnNode(node.position.x, node.position.y);
    },
    [onSelect, centerOnNode],
  );

  const lastRecenter = useRef(recenterSignal);
  useEffect(() => {
    if (recenterSignal === lastRecenter.current) return;
    lastRecenter.current = recenterSignal;
    const node = nodes.find((n) => n.id === selectedId);
    if (node) centerOnNode(node.position.x, node.position.y);
  }, [recenterSignal, nodes, selectedId, centerOnNode]);

  const handlers = useMemo<DepartmentCanvasHandlers>(
    () => ({ onToggleCollapse }),
    [onToggleCollapse],
  );

  return (
    <DepartmentCanvasProvider value={handlers}>
      <ReactFlow<OrgFlowNode>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onPaneClick={() => onSelect(COMPANY_NODE_ID)}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesFocusable={false}
        elementsSelectable
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
        minZoom={0.2}
        maxZoom={1.75}
        proOptions={{ hideAttribution: true }}
        className="bg-transparent"
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.5} color="var(--brown-200)" />
        <Controls showInteractive={false} className="!rounded-lg !border !border-brown-200 !bg-white !shadow-sm" />
      </ReactFlow>
      <style>{`.react-flow__node { transition: transform 300ms ease; }`}</style>
    </DepartmentCanvasProvider>
  );
}

export function DepartmentCanvas(props: Props) {
  return (
    <ReactFlowProvider>
      <DepartmentCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
