"use client";

import "@xyflow/react/dist/style.css";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useReactFlow,
  useStore,
  useStoreApi,
  useViewport,
  type Connection,
  type Edge,
  type IsValidConnection,
  type Node,
  type NodeMouseHandler,
  type OnNodeDrag,
} from "@xyflow/react";
import { Plus, TriangleAlert, UserPlus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/public/desact/src/components/ui/popover";
import { UserPickerField, type PickedUser } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import { initialsOf, laneColor } from "./laneColors";
import { Button } from "@/public/desact/src/components/ui/button";
import { cn } from "@/public/desact/src/components/ui/utils";
import type { ProcessType } from "@/models/lifecycle";
import { dayLabel, laneIdOf, type DraftItem } from "./draft";
import { isTypingTarget, keyToCommand, type CanvasCommand } from "./keyboard";
import {
  blockHeight,
  BLOCK_W,
  boundsForOffsets,
  boundsForTasks,
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
export const RULER_H = 32;
/** Room under the last lane for *Add Person*, which sits there. */
const LANE_TAIL = 48;

export type ZoomPreset = "beforeStart" | "firstWeek" | "ninetyDays" | "fit";

/** In the words of the domain, not percentages (research § B.3). */
export const ZOOM_PRESETS: { id: ZoomPreset; label: string; from: number; to: number }[] = [
  { id: "beforeStart", label: "Before Start", from: -14, to: 0 },
  // A few days either side of Day 1, at a zoom where a block and a person's name read in full.
  { id: "firstWeek", label: "First Week", from: -2, to: 6 },
  { id: "ninetyDays", label: "90 Days", from: 0, to: 90 },
  { id: "fit", label: "Fit", from: Number.NEGATIVE_INFINITY, to: Number.POSITIVE_INFINITY },
];

export type CanvasProps = {
  /** Whose dates the ruler names: Day 1 for joining, Last Day for leaving. */
  type?: ProcessType;
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
  /** A person picked under the lanes: a lane of their own, to put tasks in. */
  onAddPersonAction?: (person: PickedUser) => void;
};

/** An arrow's id: the waiting task, then the one it waits for. */
export const edgeId = (dependentKey: string, predecessorKey: string) => `${predecessorKey}->${dependentKey}`;

function Ruler({ layout }: { layout: Layout }) {
  const { x, zoom } = useViewport();
  const dayOne = dayOneColumn(layout.axis);
  return (
    <div className="relative h-full overflow-hidden bg-white" aria-hidden>
      {layout.axis.columns.map((c) => {
        const left = x + c.x * zoom;
        const width = c.width * zoom;
        if (left + width < -50 || left > 6000) return null;
        return (
          <div
            key={c.id}
            className="absolute top-0 flex h-full flex-col items-center justify-center overflow-hidden whitespace-nowrap border-l border-brown-100 px-1 text-center"
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

/**
 * Who does the tasks, down the side: each person in their own colour with their initials, their name in
 * full — wrapped, never cut — and, under the last of them, *Add Person* for a lane of somebody named.
 */
function LaneHeaders({ layout, readOnly, onAdd, onAddPerson }: {
  layout: Layout;
  readOnly: boolean;
  onAdd: CanvasProps["onAddInLaneAction"];
  onAddPerson?: CanvasProps["onAddPersonAction"];
}) {
  const { y, zoom } = useViewport();
  const [picking, setPicking] = useState(false);
  return (
    <div className="relative h-full overflow-hidden bg-white">
      {layout.lanes.map((lane, index) => (
        <div
          key={lane.id}
          className="absolute left-0 right-0 flex items-start gap-2 overflow-hidden border-b border-white px-3 pt-3"
          style={{ top: y + lane.top * zoom, height: lane.height * zoom }}
        >
          <span className={cn("absolute bottom-1 left-0 top-1 w-1 rounded-r", laneColor(index).stripe)} aria-hidden />
          <span
            className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold", laneColor(index).avatar)}
            aria-hidden
          >
            {initialsOf(lane.label)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block break-words text-sm font-medium leading-5 text-brown-900">{lane.label}</span>
            {lane.problem && (
              <span className="flex items-center gap-1 text-xs text-warning-700">
                <TriangleAlert className="h-3 w-3" />
                {lane.problem === "MISSING" ? "Nobody chosen" : lane.problem === "LEFT" ? "Has left" : "Not started"}
              </span>
            )}
          </span>
          {!readOnly && (
            <Button type="button"
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
      {!readOnly && onAddPerson && (
        <div className="absolute left-0 right-0 px-3 pt-2" style={{ top: y + layout.height * zoom }}>
          <Popover open={picking} onOpenChange={setPicking}>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-brown-700">
                <UserPlus className="h-4 w-4" />
                Add Person
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80 space-y-2">
              <p className="text-sm font-medium">Add a person to the timeline</p>
              <p className="text-xs text-muted-foreground">
                Somebody named — HR, IT, a buddy. A named person makes the template depend on them.
              </p>
              <UserPickerField
                value={null}
                onChange={(u) => {
                  if (!u) return;
                  onAddPerson(u);
                  setPicking(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}

function TemplateCanvasInner({
  type, items, layout, readOnly, selectedKey, selectedEdgeId, onSelectBlockAction, onFocusBlockAction, onSelectEdgeAction, onMoveAction,
  onConnectAction, onCellClickAction, onAddInLaneAction, onCommandAction, announcement, onAddPersonAction,
}: CanvasProps) {
  const { fitBounds, getViewport, setViewport } = useReactFlow();
  const store = useStoreApi();
  const paneRef = useRef<HTMLDivElement>(null);
  const [dragHint, setDragHint] = useState<string | null>(null);

  // The lanes stay under the ruler. When every person fits the pane's height there is nothing to scroll to
  // vertically, so the extent below the lanes is the pane itself and a scroll cannot move them; only a template
  // with more people than fit scrolls down, and no further than its last lane (owner, 2026-11-02).
  const zoom = useStore((st) => st.transform[2]);
  const [paneHeight, setPaneHeight] = useState(0);
  useEffect(() => {
    const el = paneRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setPaneHeight(el.clientHeight));
    observer.observe(el);
    setPaneHeight(el.clientHeight);
    return () => observer.disconnect();
  }, []);
  const contentHeight = layout.height + LANE_TAIL;
  const lanesFit = paneHeight > 0 && contentHeight * zoom <= paneHeight;
  const extentBottom = Math.max(contentHeight, paneHeight > 0 ? paneHeight / zoom : contentHeight);

  // A plain wheel on a timeline that does not scroll vertically moves it through the days, the way a timeline
  // is read; Ctrl/Cmd + wheel still zooms, and a horizontal swipe still pans.
  const onWheelCapture = (event: React.WheelEvent) => {
    if (!lanesFit || event.ctrlKey || event.metaKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.stopPropagation();
    void store.getState().panBy({ x: -event.deltaY, y: 0 });
  };

  const laneLabel = useCallback((i: DraftItem) => layout.lanes.find((l) => l.id === laneIdOf(i))?.label ?? "", [layout]);
  const laneIndex = useCallback((i: DraftItem) => layout.lanes.findIndex((l) => l.id === laneIdOf(i)), [layout]);
  const tints = useMemo(() => Object.fromEntries(layout.lanes.map((l, index) => [l.id, laneColor(index).tint])), [layout]);

  const computedNodes = useMemo<Node[]>(() => {
    const grid: GridFlowNode = {
      id: "__grid",
      type: "grid",
      position: { x: 0, y: 0 },
      data: {
        layout,
        readOnly,
        tints,
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
      data: { item, laneLabel: laneLabel(item), selected: item.key === selectedKey, readOnly, onFocusAction: onFocusBlockAction, type,
        accent: laneColor(laneIndex(item)).accent, chip: laneColor(laneIndex(item)).avatar },
      draggable: !readOnly,
      connectable: !readOnly,
      width: BLOCK_W,
      height: blockHeight(item),
      style: { width: BLOCK_W, height: blockHeight(item) },
    }));
    return [grid, ...tasks];
  }, [items, layout, readOnly, selectedKey, laneLabel, laneIndex, tints, onFocusBlockAction, onCellClickAction, type]);

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
    const bounds = id === "fit" ? boundsForTasks(layout) : boundsForOffsets(layout, p.from, p.to);
    // Fitted, then pinned to the top: centred, a short template floated in the middle of the pane, its
    // people far from the ruler they are read against.
    // After the fit's own animation: its promise settles before the animation ends, and pinning then was
    // undone by the frames still to come.
    void fitBounds(bounds, { padding: 0.04, duration });
    window.setTimeout(() => {
      const v = getViewport();
      if (v.y !== 0) void setViewport({ ...v, y: 0 }, { duration: duration ? 120 : 0 });
    }, duration + 20);
  }, [fitBounds, getViewport, setViewport, layout]);

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
    return { timing, lane, text: `${dayLabel(timing, type)} · ${lane.label}` };
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

  // A circle is not refused here: refused here, the drop did nothing at all and nobody learnt why. The
  // editor's `connect` refuses it and says so (walk of 2026-10-30).
  const isValidConnection: IsValidConnection<Edge> = (c) => Boolean(c.source && c.target);

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
      className="relative grid h-full min-h-[420px] overflow-hidden bg-white"
      style={{ gridTemplateColumns: `${LANE_HEADER_W}px 1fr`, gridTemplateRows: `${RULER_H}px 1fr` }}
      onKeyDown={onKeyDown}
      data-test="template-canvas"
    >
      <div className="bg-white" />
      <Ruler layout={layout} />
      <LaneHeaders layout={layout} readOnly={readOnly} onAdd={onAddInLaneAction} onAddPerson={onAddPersonAction} />
      <div ref={paneRef} className="relative min-h-0" onWheelCapture={onWheelCapture}>
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
          // Nothing above the first lane, and below it only what the pane cannot show: panned, the people left a
          // gap under the ruler they are read against.
          translateExtent={[[-120, 0], [layout.axis.width + 120, extentBottom]]}
          minZoom={0.2}
          maxZoom={1.6}
          proOptions={{ hideAttribution: true }}
          className="bg-transparent"
        >
        </ReactFlow>

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
