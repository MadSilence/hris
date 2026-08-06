"use client";

import "@xyflow/react/dist/style.css";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useReactFlow,
  type NodeMouseHandler,
  type OnNodeDrag,
} from "@xyflow/react";

import { useOrgChartFlow } from "@/components/modules/organization/orgChart/hooks/useOrgChartFlow/useOrgChartFlow";
import type { OrgTreeNode } from "@/components/modules/organization/orgChart/utils/buildOrgTree";

import { UserNode, NODE_H, NODE_W, type UserFlowNode } from "./UserNode";
import {
  OrgChartCanvasProvider,
  type OrgChartCanvasHandlers,
} from "./OrgChartCanvasContext";

const nodeTypes = { user: UserNode };

type Props = Pick<OrgChartCanvasHandlers, "onToggleCollapse"> & {
  roots: OrgTreeNode[];
  collapsed: Set<string>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  recenterSignal: number;
  canReparent: boolean;
  canDrop: (userId: string, targetId: string) => boolean;
  onReparent: (userId: string, targetId: string) => void;
};

function OrgChartCanvasInner({
  roots,
  collapsed,
  selectedId,
  onSelect,
  onToggleCollapse,
  recenterSignal,
  canReparent,
  canDrop,
  onReparent,
}: Props) {
  const { nodes: computedNodes, edges } = useOrgChartFlow({ roots, collapsed, selectedId });
  const [nodes, setNodes, onNodesChange] = useNodesState<UserFlowNode>(computedNodes);
  const { setCenter, getZoom, getIntersectingNodes } = useReactFlow();
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  useEffect(() => {
    setNodes(computedNodes);
  }, [computedNodes, setNodes]);

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

  const pickDropTarget = useCallback(
    (node: UserFlowNode): UserFlowNode | null => {
      const hits = getIntersectingNodes(node) as UserFlowNode[];
      return hits.find((n) => n.id !== node.id && canDrop(node.id, n.id)) ?? null;
    },
    [getIntersectingNodes, canDrop],
  );

  const handleNodeDrag: OnNodeDrag<UserFlowNode> = useCallback(
    (_event, node) => {
      setDropTargetId(pickDropTarget(node)?.id ?? null);
    },
    [pickDropTarget],
  );

  const handleNodeDragStop: OnNodeDrag<UserFlowNode> = useCallback(
    (_event, node) => {
      const target = pickDropTarget(node);
      setDropTargetId(null);
      setNodes(computedNodes); // snap back; a successful reparent re-lays-out after refetch
      if (target) onReparent(node.id, target.id);
    },
    [pickDropTarget, onReparent, setNodes, computedNodes],
  );

  const lastRecenter = useRef(recenterSignal);
  useEffect(() => {
    if (recenterSignal === lastRecenter.current) return;
    lastRecenter.current = recenterSignal;
    const node = nodes.find((n) => n.id === selectedId);
    if (node) centerOnNode(node.position.x, node.position.y);
  }, [recenterSignal, nodes, selectedId, centerOnNode]);

  const handlers = useMemo<OrgChartCanvasHandlers>(
    () => ({ onToggleCollapse, dropTargetId }),
    [onToggleCollapse, dropTargetId],
  );

  return (
    <OrgChartCanvasProvider value={handlers}>
      <ReactFlow<UserFlowNode>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={handleNodeClick}
        onNodeDrag={canReparent ? handleNodeDrag : undefined}
        onNodeDragStop={canReparent ? handleNodeDragStop : undefined}
        onPaneClick={() => onSelect(null)}
        nodesDraggable={canReparent}
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
      <style>{`.react-flow__node:not(.dragging) { transition: transform 300ms ease; }`}</style>
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
