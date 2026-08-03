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

import { useOrgChartFlow } from "@/components/modules/organization/orgChart/hooks/useOrgChartFlow/useOrgChartFlow";
import type { OrgTreeNode } from "@/components/modules/organization/orgChart/utils/buildOrgTree";

import { UserNode, NODE_H, NODE_W, type UserFlowNode } from "./UserNode";
import {
  OrgChartCanvasProvider,
  type OrgChartCanvasHandlers,
} from "./OrgChartCanvasContext";

const nodeTypes = { user: UserNode };

type Props = OrgChartCanvasHandlers & {
  roots: OrgTreeNode[];
  collapsed: Set<string>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  recenterSignal: number;
};

function OrgChartCanvasInner({
  roots,
  collapsed,
  selectedId,
  onSelect,
  onToggleCollapse,
  recenterSignal,
}: Props) {
  const { nodes, edges } = useOrgChartFlow({ roots, collapsed, selectedId });
  const { setCenter, getZoom } = useReactFlow();

  const centerOnNode = useCallback(
    (x: number, y: number) => {
      setCenter(x + NODE_W / 2, y + NODE_H / 2, { zoom: getZoom(), duration: 450 });
    },
    [setCenter, getZoom],
  );

  const handleNodeClick: NodeMouseHandler<UserFlowNode> = useCallback(
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

  const handlers = useMemo<OrgChartCanvasHandlers>(() => ({ onToggleCollapse }), [onToggleCollapse]);

  return (
    <OrgChartCanvasProvider value={handlers}>
      <ReactFlow<UserFlowNode>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onPaneClick={() => onSelect(null)}
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
    </OrgChartCanvasProvider>
  );
}

export function OrgChartCanvas(props: Props) {
  return (
    <ReactFlowProvider>
      <OrgChartCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
