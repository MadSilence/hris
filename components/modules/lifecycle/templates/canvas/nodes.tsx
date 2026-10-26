"use client";

import React from "react";
import {
  BaseEdge,
  getBezierPath,
  Handle,
  Position,
  useStore,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { Hourglass, Plus, TriangleAlert } from "lucide-react";
import { cn } from "@/public/desact/src/components/ui/utils";
import { TASK_KIND_LABELS } from "@/models/lifecycle";
import { dayLabel, type DraftItem } from "./draft";
import { BLOCK_H, BLOCK_W, dayOneColumn, type Layout } from "./timeAxis";
import { TASK_KIND_ICON } from "./TaskKindIcon";

// ── a task ───────────────────────────────────────────────────────────────────────────────────

export type TaskNodeData = {
  item: DraftItem;
  laneLabel: string;
  selected: boolean;
  readOnly: boolean;
  onFocusAction: (key: string) => void;
};
export type TaskFlowNode = Node<TaskNodeData, "task">;

/** Below this zoom a block shows its title only — the semantic zoom that keeps an overview calm. */
const COMPACT_BELOW = 0.6;

/**
 * A task block: one line of title, one of meta — the kind as an icon, the day, and an hourglass when it
 * waits. White, a hairline border, no shadow at rest; a soft one while dragged (design direction).
 */
export function TaskBlockNode({ data, dragging }: NodeProps<TaskFlowNode>) {
  const compact = useStore((s) => s.transform[2] < COMPACT_BELOW);
  const { item } = data;
  const Icon = TASK_KIND_ICON[item.kind];
  const title = item.title || "Untitled task";
  const warn = item.assigneeKind === "SPECIFIC_USER" && (item.assigneeProblem !== null || !item.assigneeUserId);

  return (
    <div
      role="button"
      tabIndex={0}
      data-test="task-block"
      aria-pressed={data.selected}
      aria-label={`${title}, ${dayLabel(item)}, ${data.laneLabel}${item.waitsFor.length ? `, waits for ${item.waitsFor.length} task${item.waitsFor.length === 1 ? "" : "s"}` : ""}`}
      title={title}
      onFocus={() => data.onFocusAction(item.key)}
      className={cn(
        "group flex h-full w-full flex-col justify-center rounded-lg border bg-white px-2.5 text-left outline-none",
        "transition-shadow duration-150 motion-reduce:transition-none",
        data.selected ? "border-brown-500 ring-2 ring-brown-300" : "border-brown-200 hover:border-brown-300",
        dragging && "shadow-lg",
      )}
    >
      {!data.readOnly && (
        <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-brown-300 !bg-white" />
      )}
      <span className="truncate text-sm font-medium leading-5 text-brown-900">{title}</span>
      {!compact && (
        <span className="flex items-center gap-1 text-xs leading-4 text-muted-foreground">
          <Icon className="h-3 w-3 shrink-0" aria-label={TASK_KIND_LABELS[item.kind]} />
          <span className="truncate">{dayLabel(item)}</span>
          {item.waitsFor.length > 0 && <Hourglass className="h-3 w-3 shrink-0" aria-label="Waits for another task" />}
          {warn && <TriangleAlert className="h-3 w-3 shrink-0 text-warning-700" aria-label="Needs a person who can take it" />}
        </span>
      )}
      {!data.readOnly && (
        <Handle
          type="source"
          position={Position.Right}
          aria-label="Drag to the task that waits for this one"
          className="!h-2.5 !w-2.5 !border-brown-400 !bg-white opacity-60 group-hover:opacity-100"
        />
      )}
    </div>
  );
}

// ── the grid behind the tasks ────────────────────────────────────────────────────────────────

export type GridNodeData = {
  layout: Layout;
  readOnly: boolean;
  onCellClickAction: (laneId: string, columnId: string, clientX: number, clientY: number) => void;
};
export type GridFlowNode = Node<GridNodeData, "grid">;

/**
 * Day columns as hairlines, lanes as a barely-there alternating tint, and Day 1 as the one accent line
 * (research § B.4). Each lane × column cell is a place to click to add a task there.
 */
export function GridNode({ data }: NodeProps<GridFlowNode>) {
  const { layout } = data;
  const dayOne = dayOneColumn(layout.axis);
  return (
    <div className="relative" style={{ width: layout.axis.width, height: layout.height }} aria-hidden>
      {layout.lanes.map((lane, index) => (
        <div
          key={lane.id}
          className={cn("absolute left-0 right-0 border-b border-brown-100/70", index % 2 === 1 && "bg-brown-50/40")}
          style={{ top: lane.top, height: lane.height }}
        />
      ))}
      {layout.axis.columns.map((c) => (
        <div
          key={c.id}
          className={cn("absolute top-0 border-l border-brown-100/60", c.kind === "beforeStart" && "bg-brown-50/70")}
          style={{ left: c.x, width: c.width, height: layout.height }}
        />
      ))}
      <div className="absolute top-0 w-0.5 bg-primary" style={{ left: dayOne.x - 1, height: layout.height }} />
      {!data.readOnly && layout.lanes.map((lane) => layout.axis.columns.map((c) => (
        <div
          key={`${lane.id}|${c.id}`}
          data-test={`cell-${lane.id}-${c.id}`}
          className="group absolute flex items-center justify-center"
          style={{ left: c.x, top: lane.top, width: c.width, height: lane.height }}
          onClick={(e) => data.onCellClickAction(lane.id, c.id, e.clientX, e.clientY)}
        >
          <Plus className="h-4 w-4 text-brown-300 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      )))}
    </div>
  );
}

// ── an arrow ─────────────────────────────────────────────────────────────────────────────────

export type WaitsForEdge = Edge<{ selected: boolean }, "waits">;

/** "Waits for": an arrow from the task waited for to the task that waits. Neutral; thicker when selected. */
export function WaitsForEdgeView({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, data }: EdgeProps<WaitsForEdge>) {
  const [path] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
  return (
    <BaseEdge
      id={id}
      path={path}
      markerEnd={markerEnd}
      style={{ stroke: data?.selected ? "var(--brown-700)" : "var(--brown-400)", strokeWidth: data?.selected ? 2.5 : 1.5 }}
    />
  );
}

export const BLOCK_SIZE = { width: BLOCK_W, height: BLOCK_H };
