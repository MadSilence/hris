"use client";

import React from "react";
import { useTranslations } from "next-intl";
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
import { Add01Icon, Alert02Icon, HourglassIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { cn } from "@/lib/cn";
import type { ProcessType } from "@/models/lifecycle";
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
  type?: ProcessType;
  /** The lane's colour, as its left edge: whose task it is, at a glance. */
  accent?: string;
  /** The lane's colour, as the tint of the kind's icon. */
  chip?: string;
};
export type TaskFlowNode = Node<TaskNodeData, "task">;

/** Below this zoom a block shows its title only — the semantic zoom that keeps an overview calm. */
const COMPACT_BELOW = 0.6;

/**
 * A task card: the kind as its own icon in the lane's colour, the title in full — wrapped onto as many lines
 * as it needs, up to four — and under it the day, with an hourglass when it waits. White on the lane's tint,
 * the lane's colour as its left edge, a soft shadow that lifts on hover and while dragged.
 */
export function TaskBlockNode({ data, dragging }: NodeProps<TaskFlowNode>) {
  const t = useTranslations("lifecycle");
  const compact = useStore((s) => s.transform[2] < COMPACT_BELOW);
  const { item } = data;
  const kindIcon = TASK_KIND_ICON[item.kind];
  const title = item.title || t("shared.untitledTask");
  const day = dayLabel(item, t, data.type);
  const warn = item.assigneeKind === "SPECIFIC_USER" && (item.assigneeProblem !== null || !item.assigneeUserId);

  return (
    <div
      role="button"
      tabIndex={0}
      data-test="task-block"
      aria-pressed={data.selected}
      aria-label={item.waitsFor.length
        ? t("canvas.blockLabelWaits", { title, day, lane: data.laneLabel, count: item.waitsFor.length })
        : t("canvas.blockLabel", { title, day, lane: data.laneLabel })}
      title={title}
      onFocus={() => data.onFocusAction(item.key)}
      className={cn(
        "group flex h-full w-full flex-col justify-between gap-1 rounded-popover border-l-[3px] bg-card px-2.5 py-2 text-left outline-none",
        "shadow-raised",
        "transition-[box-shadow,transform] duration-(--duration-hover) hover:-translate-y-px hover:shadow-popover motion-reduce:transition-none",
        data.accent ?? "border-l-field",
        data.selected && "ring-2 ring-accent",
        dragging && "shadow-drag",
      )}
    >
      {!data.readOnly && (
        <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-field !bg-card" />
      )}
      <span className="line-clamp-4 break-words text-label font-medium leading-5 text-primary">{title}</span>
      {!compact && (
        <span className="flex items-center gap-1.5 text-hint leading-4 text-tertiary">
          <span className={cn("grid h-4 w-4 shrink-0 place-items-center rounded-tag", data.chip ?? "bg-mist text-secondary")}>
            <Icon icon={kindIcon} size="sm" className="size-3.5" label={t(`taskKind.${item.kind}`)} />
          </span>
          <span className="truncate">{day}</span>
          {item.waitsFor.length > 0 && <Icon icon={HourglassIcon} size="sm" className="shrink-0" label={t("canvas.waitsForAnother")} />}
          {warn && <Icon icon={Alert02Icon} size="sm" className="shrink-0 text-status-pending-text" label={t("shared.needsPerson")} />}
        </span>
      )}
      {!data.readOnly && (
        <Handle
          type="source"
          position={Position.Right}
          aria-label={t("canvas.dragToConnect")}
          className="!h-2.5 !w-2.5 !border-strong !bg-card opacity-60 group-hover:opacity-100"
        />
      )}
    </div>
  );
}

// ── the grid behind the tasks ────────────────────────────────────────────────────────────────

export type GridNodeData = {
  layout: Layout;
  readOnly: boolean;
  /** Each lane's tint, by lane id. */
  tints: Record<string, string>;
  onCellClickAction: (laneId: string, columnId: string, clientX: number, clientY: number) => void;
};
export type GridFlowNode = Node<GridNodeData, "grid">;

/**
 * Day columns as hairlines, each lane in its person's tint, and Day 1 as the one accent line (research
 * § B.4). Each lane × column cell is a place to click to add a task there.
 */
export function GridNode({ data }: NodeProps<GridFlowNode>) {
  const { layout } = data;
  const dayOne = dayOneColumn(layout.axis);
  return (
    <div className="relative" style={{ width: layout.axis.width, height: layout.height }} aria-hidden>
      {layout.lanes.map((lane) => (
        <div
          key={lane.id}
          className={cn("absolute left-0 right-0 border-b border-card", data.tints[lane.id])}
          style={{ top: lane.top, height: lane.height }}
        />
      ))}
      {layout.axis.columns.map((c) => (
        <div
          key={c.id}
          className={cn("absolute top-0 border-l border-divider/40", c.kind === "beforeStart" && "bg-mist/40")}
          style={{ left: c.x, width: c.width, height: layout.height }}
        />
      ))}
      <div className="absolute top-0 w-0.5 bg-accent" style={{ left: dayOne.x - 1, height: layout.height }} />
      {!data.readOnly && layout.lanes.map((lane) => layout.axis.columns.map((c) => (
        <div
          key={`${lane.id}|${c.id}`}
          // i18n-exempt: a test id
          data-test={`cell-${lane.id}-${c.id}`}
          className="group absolute flex items-center justify-center"
          style={{ left: c.x, top: lane.top, width: c.width, height: lane.height }}
          onClick={(e) => data.onCellClickAction(lane.id, c.id, e.clientX, e.clientY)}
        >
          <Icon icon={Add01Icon} size="sm" className="text-disabled opacity-0 transition-opacity group-hover:opacity-100" />
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
      style={{ stroke: data?.selected ? "var(--accent)" : "var(--border-strong)", strokeWidth: data?.selected ? 2.5 : 1.5 }}
    />
  );
}

export const BLOCK_SIZE = { width: BLOCK_W, height: BLOCK_H };
