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

import type { DepartmentTreeNode } from "@/models/departments";
import { useDepartmentFlow, type OrgFlowNode } from "@/components/modules/settings/modules/departments/hooks/useDepartmentFlow/useDepartmentFlow";

import { DepartmentNode, NODE_H, NODE_W } from "./DepartmentNode";
import { CompanyNode, COMPANY_NODE_ID } from "./CompanyNode";
import {
  DepartmentCanvasProvider,
  type DepartmentCanvasHandlers,
} from "./DepartmentCanvasContext";

const nodeTypes = { department: DepartmentNode, company: CompanyNode };

type Props = Pick<DepartmentCanvasHandlers, "onToggleCollapse"> & {
  tree: DepartmentTreeNode[];
  company: { name: string; logo: string | null; memberCount: number };
  collapsed: Set<string>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  recenterSignal: number;
  matchedIds?: Set<string>;
  searchActive?: boolean;
  /** Reorganize mode: nodes become draggable and a drop asks for confirmation. */
  editMode?: boolean;
  canDrop?: (draggedId: string, targetId: string) => boolean;
  onDropRequest?: (draggedId: string, targetId: string) => void;
};

function DepartmentCanvasInner({
  tree,
  company,
  collapsed,
  selectedId,
  onSelect,
  onToggleCollapse,
  recenterSignal,
  matchedIds,
  searchActive,
  editMode = false,
  canDrop,
  onDropRequest,
}: Props) {
  const { nodes: computedNodes, edges } = useDepartmentFlow({
    tree,
    company,
    collapsed,
    selectedId,
    matchedIds,
    searchActive,
  });
  const [nodes, setNodes, onNodesChange] = useNodesState<OrgFlowNode>(computedNodes);
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

  const handleNodeClick: NodeMouseHandler<OrgFlowNode> = useCallback(
    (_event, node) => {
      onSelect(node.id);
      centerOnNode(node.position.x, node.position.y);
    },
    [onSelect, centerOnNode],
  );

  const pickDropTarget = useCallback(
    (node: OrgFlowNode): OrgFlowNode | null => {
      const hits = getIntersectingNodes(node) as OrgFlowNode[];
      return hits.find((n) => n.id !== node.id && (canDrop?.(node.id, n.id) ?? false)) ?? null;
    },
    [getIntersectingNodes, canDrop],
  );

  const handleNodeDrag: OnNodeDrag<OrgFlowNode> = useCallback(
    (_event, node) => {
      setDropTargetId(pickDropTarget(node)?.id ?? null);
    },
    [pickDropTarget],
  );

  const handleNodeDragStop: OnNodeDrag<OrgFlowNode> = useCallback(
    (_event, node) => {
      const target = pickDropTarget(node);
      setDropTargetId(null);
      setNodes(computedNodes); // snap back; a confirmed move re-lays-out after the refetch
      if (target) onDropRequest?.(node.id, target.id);
    },
    [pickDropTarget, onDropRequest, setNodes, computedNodes],
  );

  const lastRecenter = useRef(recenterSignal);
  useEffect(() => {
    if (recenterSignal === lastRecenter.current) return;
    lastRecenter.current = recenterSignal;
    const node = nodes.find((n) => n.id === selectedId);
    if (node) centerOnNode(node.position.x, node.position.y);
  }, [recenterSignal, nodes, selectedId, centerOnNode]);

  const handlers = useMemo<DepartmentCanvasHandlers>(
    () => ({ onToggleCollapse, dropTargetId }),
    [onToggleCollapse, dropTargetId],
  );

  return (
    <DepartmentCanvasProvider value={handlers}>
      <ReactFlow<OrgFlowNode>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={handleNodeClick}
        onNodeDrag={editMode ? handleNodeDrag : undefined}
        onNodeDragStop={editMode ? handleNodeDragStop : undefined}
        onPaneClick={() => onSelect(COMPANY_NODE_ID)}
        nodesDraggable={editMode}
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
