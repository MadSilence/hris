"use client";

import "@xyflow/react/dist/style.css";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useReactFlow,
  useViewport,
  type Connection,
  type Edge,
  type IsValidConnection,
  type Node,
  type NodeMouseHandler,
  type OnNodeDrag,
} from "@xyflow/react";
import { Plus, TriangleAlert, UserRound } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { cn } from "@/public/desact/src/components/ui/utils";
import { dayLabel, laneIdOf, wouldCreateCycle, type DraftItem } from "./draft";
import { isTypingTarget, keyToCommand, type CanvasCommand } from "./keyboard";
import {
  BLOCK_H,
  BLOCK_W,
  boundsForOffsets,
  dayOneColumn,
  dropTarget,
  timingForColumn,
  type Layout,
} from "./timeAxis";
import {
  GridNode,
  TaskBlockNode,
  WaitsForEdgeView,
  type GridFlowNode,
  type TaskFlowNode,
  type WaitsForEdge,
} from "./nodes";

const nodeTypes = { task: TaskBlockNode, grid: GridNode };
const edgeTypes = { waits: WaitsForEdgeView };

export const LANE_HEADER_W = 184;
export const RULER_H = 44;

export type ZoomPreset = "beforeStart" | "firstWeek" | "ninetyDays" | "fit";

/** In the words of the domain, not percentages (research § B.3). */
export const ZOOM_PRESETS: { id: ZoomPreset; label: string; from: number; to: number }[] = [
  { id: "beforeStart", label: "Before Start", from: -14, to: 0 },
  { id: "firstWeek", label: "First Week", from: -3, to: 7 },
  { id: "ninetyDays", label: "90 Days", from: 0, to: 90 },
  { id: "fit", label: "Fit", from: Number.NEGATIVE_INFINITY, to: Number.POSITIVE_INFINITY },
];

export type CanvasProps = {
  items: DraftItem[];
  layout: Layout;
  readOnly: boolean;
  selectedKey: string | null;
  selectedEdgeId: string | null;
  /** A block clicked: select it and open its panel. */
  onSelectBlockAction: (key: string | null) => void;
  /** A block reached by Tab: select it; Enter opens the panel. */
  onFocusBlockAction: (key: string) => void;
  onSelectEdgeAction: (id: string | null) => void;
  /** A block dropped: the task's new timing and lane. */
  onMoveAction: (key: string, timing: Pick<DraftItem, "dueKind" | "offsetDays">, laneId: string) => void;
  /** An arrow drawn: `dependentKey` now waits for `predecessorKey`. */
  onConnectAction: (dependentKey: string, predecessorKey: string) => void;
  /** An empty cell clicked, at a point relative to the canvas element. */
  onCellClickAction: (laneId: string, columnId: string, point: { left: number; top: number }) => void;
  /** A lane header's own add button, with where the card should open, relative to the canvas element. */
  onAddInLaneAction: (laneId: string, point: { left: number; top: number }) => void;
  onCommandAction: (command: CanvasCommand) => void;
  /** A sentence for the screen reader and the eye: "Set up laptop moved to Day 4". */
  announcement: string | null;
};

/** An arrow's id: the waiting task, then the one it waits for. */
export const edgeId = (dependentKey: string, predecessorKey: string) => `${predecessorKey}->${dependentKey}`;

function Ruler({ layout }: { layout: Layout }) {
  const { x, zoom } = useViewport();
  const dayOne = dayOneColumn(layout.axis);
  return (
    <div className="relative h-full overflow-hidden border-b border-brown-100 bg-white" aria-hidden>
      {layout.axis.columns.map((c) => {
        const left = x + c.x * zoom;
        const width = c.width * zoom;
        if (left + width < -50 || left > 6000) return null;
        return (
          <div
            key={c.id}
            className="absolute top-0 flex h-full flex-col justify-center overflow-hidden whitespace-nowrap px-2"
            style={{ left, width }}
          >
            <span className={cn("text-xs font-medium", c.id === dayOne.id ? "text-primary" : "text-brown-700")}>{c.label}</span>
            {c.caption && width > 60 && <span className="text-[11px] text-muted-foreground">{c.caption}</span>}
          </div>
        );
      })}
    </div>
  );
}

function LaneHeaders({ layout, readOnly, onAdd }: { layout: Layout; readOnly: boolean; onAdd: CanvasProps["onAddInLaneAction"] }) {
  const { y, zoom } = useViewport();
  return (
    <div className="relative h-full overflow-hidden border-r border-brown-100 bg-white">
      {layout.lanes.map((lane) => (
        <div
          key={lane.id}
          className="absolute left-0 right-0 flex items-start gap-2 overflow-hidden border-b border-brown-100/70 px-3 pt-3"
          style={{ top: y + lane.top * zoom, height: lane.height * zoom }}
        >
          <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-brown-900">{lane.label}</span>
            {lane.problem && (
              <span className="flex items-center gap-1 text-xs text-warning-700">
                <TriangleAlert className="h-3 w-3" />
                {lane.problem === "MISSING" ? "Nobody chosen" : lane.problem === "LEFT" ? "Has left" : "Not started"}
              </span>
            )}
          </span>
          {!readOnly && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              aria-label={`Add Task for ${lane.label}`}
              onClick={() => onAdd(lane.id, { left: LANE_HEADER_W + 8, top: RULER_H + Math.max(0, y + lane.top * zoom) })}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

function TemplateCanvasInner({
  items, layout, readOnly, selectedKey, selectedEdgeId, onSelectBlockAction, onFocusBlockAction, onSelectEdgeAction, onMoveAction,
  onConnectAction, onCellClickAction, onAddInLaneAction, onCommandAction, announcement,
}: CanvasProps) {
  const { fitBounds } = useReactFlow();
  const paneRef = useRef<HTMLDivElement>(null);
  const [preset, setPreset] = useState<ZoomPreset>("firstWeek");
  const [dragHint, setDragHint] = useState<string | null>(null);

  const laneLabel = useCallback((i: DraftItem) => layout.lanes.find((l) => l.id === laneIdOf(i))?.label ?? "", [layout]);

  const computedNodes = useMemo<Node[]>(() => {
    const grid: GridFlowNode = {
      id: "__grid",
      type: "grid",
      position: { x: 0, y: 0 },
      data: {
        layout,
        readOnly,
        onCellClickAction: (laneId, columnId, clientX, clientY) => {
          const rect = paneRef.current?.getBoundingClientRect();
          onCellClickAction(laneId, columnId, {
            left: clientX - (rect?.left ?? 0) + LANE_HEADER_W,
            top: clientY - (rect?.top ?? 0) + RULER_H,
          });
        },
      },
      draggable: false,
      selectable: false,
      connectable: false,
      focusable: false,
      zIndex: -1,
      width: layout.axis.width,
      height: layout.height,
    };
    const tasks: TaskFlowNode[] = items.map((item) => ({
      id: item.key,
      type: "task",
      position: layout.positions.get(item.key) ?? { x: 0, y: 0 },
      data: { item, laneLabel: laneLabel(item), selected: item.key === selectedKey, readOnly, onFocusAction: onFocusBlockAction },
      draggable: !readOnly,
      connectable: !readOnly,
      width: BLOCK_W,
      height: BLOCK_H,
      style: { width: BLOCK_W, height: BLOCK_H },
    }));
    return [grid, ...tasks];
  }, [items, layout, readOnly, selectedKey, laneLabel, onFocusBlockAction, onCellClickAction]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(computedNodes);
  // Carry React Flow's own measurement over to the recomputed nodes. A node handed back without
  // `measured` has its handle bounds reset until it is measured again — and a block of a fixed size is
  // never re-measured (its ResizeObserver does not fire), so every "waits for" arrow silently stopped
  // drawing after the first edit (found in the live walk of 2026-10-17).
  useEffect(() => setNodes((prev) => {
    const measured = new Map(prev.map((n) => [n.id, n.measured]));
    return computedNodes.map((n) => {
      const m = measured.get(n.id);
      return m ? { ...n, measured: m } : n;
    });
  }), [computedNodes, setNodes]);

  const edges = useMemo<WaitsForEdge[]>(() => items.flatMap((item) => item.waitsFor.map((on) => {
    const id = edgeId(item.key, on);
    return {
      id,
      type: "waits" as const,
      source: on,
      target: item.key,
      data: { selected: id === selectedEdgeId },
      markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: id === selectedEdgeId ? "var(--brown-700)" : "var(--brown-400)" },
      interactionWidth: 18,
    };
  })), [items, selectedEdgeId]);

  const fitPreset = useCallback((id: ZoomPreset, duration = 200) => {
    const p = ZOOM_PRESETS.find((z) => z.id === id) ?? ZOOM_PRESETS[1];
    const bounds = id === "fit"
      ? { x: 0, y: 0, width: layout.axis.width, height: Math.max(layout.height, BLOCK_H) }
      : boundsForOffsets(layout, p.from, p.to);
    setPreset(id);
    void fitBounds(bounds, { padding: 0.04, duration });
  }, [fitBounds, layout]);

  // Opens on the first week, where most tasks are, rather than on everything (research § B.5).
  const opened = useRef(false);
  const onInit = useCallback(() => {
    if (opened.current) return;
    opened.current = true;
    fitPreset("firstWeek", 0);
  }, [fitPreset]);

  const moveText = (item: DraftItem, node: Node) => {
    const { column, lane } = dropTarget(layout, node.position);
    const timing = timingForColumn(column, item);
    return { timing, lane, text: `${dayLabel(timing)} · ${lane.label}` };
  };

  const onNodeDrag: OnNodeDrag<Node> = (_e, node) => {
    const item = items.find((i) => i.key === node.id);
    if (item) setDragHint(moveText(item, node).text);
  };

  const onNodeDragStop: OnNodeDrag<Node> = (_e, node) => {
    setDragHint(null);
    const item = items.find((i) => i.key === node.id);
    setNodes(computedNodes); // snap to the cell; a real move re-lays-out from the data
    if (!item) return;
    const { timing, lane } = moveText(item, node);
    onMoveAction(item.key, timing, lane.id);
  };

  const onNodeClick: NodeMouseHandler<Node> = (_e, node) => {
    if (node.type === "task") onSelectBlockAction(node.id);
  };

  const isValidConnection: IsValidConnection<Edge> = (c) =>
    Boolean(c.source && c.target) && !wouldCreateCycle(items, c.target as string, c.source as string);

  const onConnect = (c: Connection) => {
    if (c.source && c.target) onConnectAction(c.target, c.source);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (isTypingTarget(event.target)) return;
    const command = keyToCommand(event, Boolean(selectedKey || selectedEdgeId));
    if (!command) return;
    event.preventDefault();
    if (command.type === "fit") fitPreset("fit");
    else onCommandAction(command);
  };

  return (
    <div
      className="relative grid h-full min-h-[420px] overflow-hidden rounded-xl border border-brown-100 bg-brown-50/30"
      style={{ gridTemplateColumns: `${LANE_HEADER_W}px 1fr`, gridTemplateRows: `${RULER_H}px 1fr` }}
      onKeyDown={onKeyDown}
      data-test="template-canvas"
    >
      <div className="border-b border-r border-brown-100 bg-white" />
      <Ruler layout={layout} />
      <LaneHeaders layout={layout} readOnly={readOnly} onAdd={onAddInLaneAction} />
      <div ref={paneRef} className="relative min-h-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={readOnly ? undefined : onNodesChange}
          onNodeDrag={readOnly ? undefined : onNodeDrag}
          onNodeDragStop={readOnly ? undefined : onNodeDragStop}
          onNodeClick={onNodeClick}
          onEdgeClick={(_e, edge) => onSelectEdgeAction(edge.id)}
          onConnect={readOnly ? undefined : onConnect}
          isValidConnection={isValidConnection}
          onInit={onInit}
          nodesDraggable={!readOnly}
          nodesConnectable={!readOnly}
          nodesFocusable={false}
          edgesFocusable={false}
          elementsSelectable={false}
          // The canvas's own keys replace these: a day or a lane per arrow, Delete asks first.
          disableKeyboardA11y
          deleteKeyCode={null}
          // Two-finger scroll pans; pinch or Ctrl/Cmd + scroll zooms (research § B.3).
          panOnScroll
          zoomActivationKeyCode={["Meta", "Control"]}
          translateExtent={[[-120, -80], [layout.axis.width + 120, layout.height + 240]]}
          minZoom={0.2}
          maxZoom={1.6}
          proOptions={{ hideAttribution: true }}
          className="bg-transparent"
        >
          <MiniMap
            pannable
            zoomable
            position="bottom-right"
            ariaLabel="Overview"
            nodeColor={(n) => (n.type === "grid" ? "transparent" : "var(--brown-300)")}
            nodeStrokeColor={() => "transparent"}
            className="!rounded-lg !border !border-brown-100 !bg-white"
          />
          <Controls showInteractive={false} showFitView={false} position="bottom-left" className="!rounded-lg !border !border-brown-100 !bg-white !shadow-none" />
        </ReactFlow>

        <div className="absolute right-3 top-3 z-10 flex gap-0.5 rounded-lg border border-brown-100 bg-white p-0.5" role="group" aria-label="Zoom">
          {ZOOM_PRESETS.map((z) => (
            <button
              key={z.id}
              type="button"
              aria-pressed={preset === z.id}
              title={z.id === "fit" ? "Fit (Alt/Option + 1)" : undefined}
              onClick={() => fitPreset(z.id)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs transition-colors",
                preset === z.id ? "bg-brown-100 font-medium text-brown-900" : "text-brown-600 hover:bg-brown-50",
              )}
            >
              {z.label}
            </button>
          ))}
        </div>

        {dragHint && (
          <div className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-md bg-brown-900 px-2.5 py-1 text-xs text-white shadow">
            {dragHint}
          </div>
        )}
      </div>
      <p className="sr-only" aria-live="polite">{announcement ?? ""}</p>
    </div>
  );
}

/** The template canvas: time across from the start day, one lane per assignee, tasks as blocks. */
export function TemplateCanvas(props: CanvasProps) {
  return (
    <ReactFlowProvider>
      <TemplateCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
