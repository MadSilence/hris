import type { AutomationDefinition, StepSpec } from "@/models/automations";
import { branches, branchList, numbers, type Branch, type InsertTarget } from "@/components/modules/automations/model/tree";

/**
 * Where every card of the editor's canvas sits — a top-down tree computed from the definition on every render, never
 * stored (the canvas rule of `hris/CLAUDE.md`, as on the lifecycle template canvas).
 *
 * The trigger's card on top, the trunk under it; a branch point (an approval, a split) ends its line and its paths
 * stand side by side under it, each as wide as the widest thing on it. Paths do not join again (K1). Pure: no React,
 * no words.
 */

export const CARD_W = 320;
/** A connector between two cards on one line. */
export const V_GAP = 48;
/** The extra height of a connector into a path: the bar, the branch pill and the "+". */
export const PILL_ROOM = 40;
/** Between two paths side by side. */
export const H_GAP = 40;
/** Where the horizontal bar of a branch runs, under the branch point. */
export const BAR_DROP = 24;

export const WHEN_H = 78;
export const PLACEHOLDER_H = 96;
/** The trigger's placeholder with "or · Describe it to noddo AI" under it. */
export const PLACEHOLDER_WITH_AI_H = 168;
export const FIRST_STEP_H = 78;
export const EMPTY_BRANCH_H = 44;

export type NodeKind = "when" | "triggerPlaceholder" | "step" | "firstStepPlaceholder" | "emptyBranch";

export type LaidNode = {
  id: string;
  kind: NodeKind;
  x: number;
  y: number;
  width: number;
  height: number;
  /** A step's own id, its number ("2A"). */
  stepId?: string;
  number?: string;
  /** An empty path: the branch point and the path. */
  branch?: { stepId: string; key: string };
};

export type BranchLabel = { kind: Branch["kind"]; name: string | null; index: number };

export type LaidEdge = {
  id: string;
  source: string;
  target: string;
  /** What the "+" on it inserts, and where a step dropped on it goes; null where the target is itself the way in. */
  insert: InsertTarget | null;
  /** Into a path: its pill (Approved, Declined, a path's name). */
  branch: BranchLabel | null;
};

/** A place a step may be dropped: the middle of a connector, under the last card of a line, an empty path. */
export type DropSpot = { key: string; x: number; y: number; target: InsertTarget };

export type TreeLayout = {
  nodes: LaidNode[];
  edges: LaidEdge[];
  spots: DropSpot[];
  bounds: { x: number; y: number; width: number; height: number };
};

/** A step card's height: the kind line and the title, and a line more for each of what it shows under it. */
export const cardHeight = ({
  title,
  subtitle,
  extraLine = false,
}: {
  title: string;
  subtitle?: string | null;
  /** "Choose who approves", "Failed in this run". */
  extraLine?: boolean;
}): number => {
  const titleLines = Math.min(2, Math.max(1, Math.ceil(title.length / 34)));
  const subtitleLines = subtitle ? Math.min(2, Math.ceil(subtitle.length / 46)) : 0;
  return 16 + 16 + 8 + 22 * titleLines + (subtitleLines ? 4 + 16 * subtitleLines : 0) + (extraLine ? 6 + 16 : 0) + 16;
};

export const stepNodeId = (stepId: string) => `step:${stepId}`;
export const TRIGGER_NODE_ID = "trigger";

export type LayoutOptions = {
  /** Each step card's height (see {@link cardHeight}); the default is one title line. */
  heightOf?: (step: StepSpec) => number;
  /** The trigger card's height. */
  whenHeight?: number;
  /** A new automation with nothing under its placeholder offers noddo AI there (F2). */
  offerAi?: boolean;
};

const lineWidth = (line: StepSpec[]): number => {
  const last = line[line.length - 1];
  if (!last || !branches(last)) return CARD_W;
  const paths = branchList(last);
  const sum = paths.reduce((acc, b) => acc + lineWidth(b.steps), 0) + H_GAP * (paths.length - 1);
  return Math.max(CARD_W, sum);
};

export const layoutTree = (definition: Pick<AutomationDefinition, "steps" | "trigger">, options: LayoutOptions = {}): TreeLayout => {
  const heightOf = options.heightOf ?? (() => cardHeight({ title: "" }));
  const nums = numbers(definition);
  const nodes: LaidNode[] = [];
  const edges: LaidEdge[] = [];
  const spots: DropSpot[] = [];
  const steps = definition.steps ?? [];

  const width = lineWidth(steps);
  const centre = width / 2;

  const topHeight = definition.trigger
    ? options.whenHeight ?? WHEN_H
    : steps.length === 0 && options.offerAi
      ? PLACEHOLDER_WITH_AI_H
      : PLACEHOLDER_H;
  nodes.push({
    id: TRIGGER_NODE_ID,
    kind: definition.trigger ? "when" : "triggerPlaceholder",
    x: centre - CARD_W / 2,
    y: 0,
    width: CARD_W,
    height: topHeight,
  });

  const addSpot = (key: string, x: number, y: number, target: InsertTarget) => spots.push({ key, x, y, target });

  /** Lays a line out from `top`, centred on `cx`, joined to `from`. */
  const place = (line: StepSpec[], cx: number, top: number, from: LaidNode, firstInsert: InsertTarget, label: BranchLabel | null) => {
    let previous = from;
    let y = top;
    let insert: InsertTarget = firstInsert;
    let edgeLabel = label;
    for (const step of line) {
      const node: LaidNode = {
        id: stepNodeId(step.id),
        kind: "step",
        x: cx - CARD_W / 2,
        y,
        width: CARD_W,
        height: heightOf(step),
        stepId: step.id,
        number: nums[step.id],
      };
      nodes.push(node);
      edges.push({ id: `${previous.id}->${node.id}`, source: previous.id, target: node.id, insert, branch: edgeLabel });
      addSpot(`edge:${previous.id}->${node.id}`, cx, plusY(previous, node, edgeLabel !== null), insert);
      previous = node;
      edgeLabel = null;
      insert = { kind: "after", stepId: step.id };
      y = node.y + node.height + V_GAP;

      if (branches(step)) {
        const paths = branchList(step);
        const total = paths.reduce((acc, b) => acc + lineWidth(b.steps), 0) + H_GAP * (paths.length - 1);
        let left = cx - total / 2;
        const childTop = node.y + node.height + V_GAP + PILL_ROOM;
        paths.forEach((b, index) => {
          const w = lineWidth(b.steps);
          const childCx = left + w / 2;
          const branchLabel: BranchLabel = { kind: b.kind, name: b.name, index };
          const start: InsertTarget = { kind: "branchStart", stepId: step.id, branchKey: b.key };
          if (b.steps.length === 0) {
            const empty: LaidNode = {
              id: `empty:${step.id}:${b.key}`,
              kind: "emptyBranch",
              x: childCx - CARD_W / 2,
              y: childTop,
              width: CARD_W,
              height: EMPTY_BRANCH_H,
              branch: { stepId: step.id, key: b.key },
            };
            nodes.push(empty);
            edges.push({ id: `${node.id}->${empty.id}`, source: node.id, target: empty.id, insert: null, branch: branchLabel });
            addSpot(`empty:${step.id}:${b.key}`, childCx, childTop + EMPTY_BRANCH_H / 2, start);
          } else {
            place(b.steps, childCx, childTop, node, start, branchLabel);
          }
          left += w + H_GAP;
        });
        return;
      }
    }
    // Under the last card of a line that does not branch: a step dropped here goes at its end.
    if (previous.kind === "step" && previous.stepId) {
      addSpot(`end:${previous.stepId}`, cx, previous.y + previous.height + V_GAP / 2, { kind: "after", stepId: previous.stepId });
    }
  };

  const trigger = nodes[0];
  if (steps.length === 0) {
    if (definition.trigger) {
      const first: LaidNode = {
        id: "firstStep",
        kind: "firstStepPlaceholder",
        x: centre - CARD_W / 2,
        y: trigger.height + V_GAP,
        width: CARD_W,
        height: FIRST_STEP_H,
      };
      nodes.push(first);
      edges.push({ id: `${trigger.id}->${first.id}`, source: trigger.id, target: first.id, insert: null, branch: null });
      addSpot("firstStep", centre, first.y + FIRST_STEP_H / 2, { kind: "trunkEnd" });
    }
  } else {
    place(steps, centre, trigger.height + V_GAP, trigger, { kind: "trunkStart" }, null);
  }

  const right = Math.max(...nodes.map((n) => n.x + n.width));
  const bottom = Math.max(...nodes.map((n) => n.y + n.height));
  const leftMost = Math.min(...nodes.map((n) => n.x));
  return { nodes, edges, spots, bounds: { x: leftMost, y: 0, width: right - leftMost, height: bottom } };
};

/** Where the "+" of a connector sits: the middle of a straight one; on a path's own segment, under its pill. */
export const plusY = (source: Pick<LaidNode, "y" | "height">, target: Pick<LaidNode, "y">, intoPath: boolean): number =>
  intoPath ? target.y - 18 : (source.y + source.height + target.y) / 2;

/** Where a branch's pill sits, on the path's own segment under the bar. */
export const pillY = (sourceBottom: number): number => sourceBottom + BAR_DROP + 22;

/** The spot nearest to a point, within `reach`. */
export const nearestSpot = (spots: DropSpot[], point: { x: number; y: number }, reach = 120): DropSpot | null => {
  let best: DropSpot | null = null;
  let bestDistance = reach;
  for (const spot of spots) {
    const d = Math.hypot(spot.x - point.x, spot.y - point.y);
    if (d <= bestDistance) {
      best = spot;
      bestDistance = d;
    }
  }
  return best;
};

/**
 * The viewport that fits `bounds` into the part of the pane the windows leave free, no larger than 100 %, in steps of
 * 5 % so the zoom reads as a round number.
 */
export const fitViewport = (
  bounds: TreeLayout["bounds"],
  pane: { width: number; height: number },
  free: { left: number; right: number; top: number; bottom: number },
  limits: { min: number; max: number } = { min: 0.3, max: 1 },
): { x: number; y: number; zoom: number } => {
  const freeW = Math.max(100, pane.width - free.left - free.right);
  const freeH = Math.max(100, pane.height - free.top - free.bottom);
  const raw = Math.min(freeW / Math.max(1, bounds.width), freeH / Math.max(1, bounds.height), limits.max);
  const zoom = Math.max(limits.min, Math.floor(raw * 20) / 20);
  const x = free.left + (freeW - bounds.width * zoom) / 2 - bounds.x * zoom;
  // Short trees sit at the top of the free area, under the sentence, not floating in the middle.
  const y = free.top - bounds.y * zoom + Math.max(0, Math.min((freeH - bounds.height * zoom) / 2, 24));
  return { x, y, zoom };
};
