"use client";

import "@xyflow/react/dist/style.css";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Background,
  BackgroundVariant,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useReactFlow,
  useViewport,
  type Node,
  type NodeMouseHandler,
  type OnNodeDrag,
} from "@xyflow/react";
import { Add01Icon, FlashIcon, MinusSignIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { useFlowAriaLabels } from "@/components/ui/Canvas";
import { STEP_TYPE_ICONS } from "@/components/modules/automations/shared";
import { allSteps, branches, findStep, type InsertTarget } from "@/components/modules/automations/model/tree";
import type { AutomationDefinition, AutomationStepType, StepSpec } from "@/models/automations";
import { useAutomationWords } from "../seams";
import { cardKeyCommand, isTypingTarget, type CardCommand, type RunCardState } from "../state/editorLogic";
import { edgeTypes, type ConnectorFlowEdge } from "./ConnectorEdge";
import {
  cardHeight,
  fitViewport,
  layoutTree,
  nearestSpot,
  stepNodeId,
  TRIGGER_NODE_ID,
  type DropSpot,
  type TreeLayout,
} from "./layout";
import { nodeTypes, type AddPlaceholderFlowNode, type CardFlowNode, type TriggerPlaceholderFlowNode } from "./nodes";
import { STEP_DRAG_TYPE } from "./stepCatalogue";

type CardTexts = {
  steps: Record<string, { kind: string; title: string; subtitle: string | null }>;
  trigger: string;
  triggerSubtitle: string | null;
};

/** What every card says, from the words of the settings part. */
const cardTexts = (definition: AutomationDefinition, words: ReturnType<typeof useAutomationWords>): CardTexts => {
  const steps: CardTexts["steps"] = {};
  for (const step of allSteps(definition)) {
    const kind = words.stepKind(step);
    steps[step.id] = { kind, title: words.stepTitle(step) || kind, subtitle: words.stepSubtitle(step) };
  }
  return {
    steps,
    trigger: definition.trigger ? words.triggerTitle(definition.trigger) : "",
    triggerSubtitle: definition.trigger ? words.triggerSubtitle(definition.trigger) : null,
  };
};

/** The same value as last time while it reads the same — so a new object with the same content changes nothing. */
const useStable = <T,>(value: T): T => {
  const ref = React.useRef(value);
  const key = JSON.stringify(value);
  const keyRef = React.useRef(key);
  if (keyRef.current !== key) {
    keyRef.current = key;
    ref.current = value;
  }
  return ref.current;
};

export type CanvasInsets = { left: number; right: number; top: number; bottom: number };

export type AutomationCanvasProps = {
  definition: AutomationDefinition;
  actions: AutomationStepType[];
  readOnly: boolean;
  selectedStepId: string | null;
  triggerSelected: boolean;
  /** F3: each card's "Add …" line, the trigger's under `null`. */
  needs: Map<string | null, string>;
  /** "· edited" on a live automation. */
  edited: Set<string>;
  runStates: Record<string, RunCardState> | null;
  /** A new automation: "or · Describe it to noddo AI" under the placeholder. */
  offerAi: boolean;
  /** What the windows cover, so a fit lands in the part left free. */
  insets: CanvasInsets;
  /** Changes whenever a window opens or closes: the canvas fits itself again. */
  fitKey: string;
  /** A step is being dragged from the Add a step window. */
  paletteDrag: boolean;
  announcement: string | null;
  onSelectStep: (id: string) => void;
  onSelectTrigger: () => void;
  onDeselect: () => void;
  onChooseTrigger: () => void;
  onOpenAi: () => void;
  onOpenAddStep: (target: InsertTarget | null) => void;
  onInsert: (type: AutomationStepType, target: InsertTarget) => void;
  onMove: (stepId: string, target: InsertTarget) => void;
  onCardCommand: (stepId: string, command: CardCommand) => void;
};

const ZOOM_MIN = 0.3;
const ZOOM_MAX = 1.5;

/** A spot that would leave a moved step where it is. */
const sameplace = (spot: DropSpot, stepId: string, layout: TreeLayout): boolean => {
  if (spot.target.kind === "after" && spot.target.stepId === stepId) return true;
  if (spot.key.endsWith(`->${stepNodeId(stepId)}`)) return true;
  // After the step just above it on its line: the edge into the moved step comes from it.
  const into = layout.edges.find((e) => e.target === stepNodeId(stepId));
  return Boolean(into && spot.key === `edge:${into.source}->${into.target}`);
};

/** − 100 % + (§ Values: 36 high, radius 10, level 2). Steps of 10 %; the number fits the view. */
const ZoomControl: React.FC<{ onFit: () => void }> = ({ onFit }) => {
  const t = useTranslations("automationsEditor");
  const { zoom } = useViewport();
  const { zoomTo } = useReactFlow();
  const step = (delta: number) => {
    const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round((zoom + delta) * 10) / 10));
    void zoomTo(next, { duration: 150 });
  };
  return (
    <div
      role="group"
      aria-label={t("canvas.zoom.label")}
      className="absolute right-6 bottom-6 z-10 flex h-9 items-center rounded-popover border border-divider bg-card shadow-popover"
    >
      <button type="button" aria-label={t("canvas.zoom.out")} onClick={() => step(-0.1)} className="flex h-full w-9 items-center justify-center text-secondary hover:text-primary outline-none focus-visible:shadow-focus rounded-popover">
        <Icon icon={MinusSignIcon} size="sm" />
      </button>
      <button type="button" aria-label={t("canvas.zoom.fit")} onClick={onFit} className="h-full min-w-14 px-1 text-label text-secondary tabular-nums hover:text-primary outline-none focus-visible:shadow-focus rounded-popover">
        {t("canvas.zoom.value", { value: Math.round(zoom * 100) })}
      </button>
      <button type="button" aria-label={t("canvas.zoom.in")} onClick={() => step(0.1)} className="flex h-full w-9 items-center justify-center text-secondary hover:text-primary outline-none focus-visible:shadow-focus rounded-popover">
        <Icon icon={Add01Icon} size="sm" />
      </button>
    </div>
  );
};

/** The dashed accent line from the selected card to the settings window (Layout 7). */
const SelectionLine: React.FC<{ node: { x: number; y: number; width: number; height: number } | null; paneWidth: number; right: number }> = ({
  node,
  paneWidth,
  right,
}) => {
  const { x, y, zoom } = useViewport();
  if (!node || right <= 0) return null;
  const startX = (node.x + node.width) * zoom + x;
  const endX = paneWidth - right;
  const lineY = (node.y + node.height / 2) * zoom + y;
  if (endX - startX < 8) return null;
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 z-[1] h-full w-full overflow-visible">
      <line x1={startX} y1={lineY} x2={endX} y2={lineY} stroke="var(--accent)" strokeWidth={1} strokeDasharray="4 4" opacity={0.6} />
    </svg>
  );
};

function CanvasInner(props: AutomationCanvasProps) {
  const {
    definition, actions, readOnly, selectedStepId, triggerSelected, needs, edited, runStates, offerAi, insets, fitKey,
    paletteDrag, announcement, onSelectStep, onSelectTrigger, onDeselect, onChooseTrigger, onOpenAi, onOpenAddStep, onInsert,
    onMove, onCardCommand,
  } = props;
  const t = useTranslations("automationsEditor");
  const words = useAutomationWords();
  const { setViewport, screenToFlowPosition } = useReactFlow();
  const paneRef = React.useRef<HTMLDivElement>(null);
  const [paneWidth, setPaneWidth] = React.useState(0);
  const [hoverSpot, setHoverSpot] = React.useState<string | null>(null);
  const [movingId, setMovingId] = React.useState<string | null>(null);

  // The words hook hands out a new object on every render; what the cards say is kept only when it changes, or the
  // nodes would be rebuilt — and React Flow's state set — on every render, for ever.
  const texts = useStable(cardTexts(definition, words));
  const { steps: stepTexts, trigger: triggerTitle, triggerSubtitle } = texts;
  const hasExtraLine = React.useCallback(
    (step: StepSpec) => Boolean(needs.get(step.id)) || runStates?.[step.id] === "failed" || runStates?.[step.id] === "notStarted",
    [needs, runStates],
  );

  const layout = React.useMemo(
    () =>
      layoutTree(definition, {
        heightOf: (step) =>
          cardHeight({ title: stepTexts[step.id]?.title ?? "", subtitle: stepTexts[step.id]?.subtitle, extraLine: hasExtraLine(step) }),
        whenHeight: cardHeight({ title: triggerTitle, subtitle: triggerSubtitle, extraLine: Boolean(needs.get(null)) }),
        offerAi: offerAi && !readOnly,
      }),
    [definition, stepTexts, hasExtraLine, triggerTitle, triggerSubtitle, needs, offerAi, readOnly],
  );

  const dragging = paletteDrag || movingId !== null;

  const cardKeys = React.useCallback(
    (stepId: string | null) => (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (isTypingTarget(event.target)) return;
      const command = cardKeyCommand(event);
      if (!command) return;
      event.preventDefault();
      event.stopPropagation();
      if (stepId === null) {
        if (command === "open") onSelectTrigger();
        if (command === "deselect") onDeselect();
        return;
      }
      if (readOnly && command !== "open" && command !== "deselect") return;
      onCardCommand(stepId, command);
    },
    [onCardCommand, onSelectTrigger, onDeselect, readOnly],
  );

  const computedNodes = React.useMemo<Node[]>(() => {
    return layout.nodes.map((n): Node => {
      const base = { id: n.id, position: { x: n.x, y: n.y }, width: n.width, height: n.height, selectable: false };
      if (n.kind === "triggerPlaceholder") {
        const node: TriggerPlaceholderFlowNode = {
          ...base,
          type: "triggerPlaceholder",
          draggable: false,
          data: { height: n.height, offerAi: offerAi && !readOnly && (definition.steps ?? []).length === 0, onChoose: readOnly ? () => undefined : onChooseTrigger, onAi: onOpenAi },
        };
        return node;
      }
      if (n.kind === "firstStepPlaceholder" || n.kind === "emptyBranch") {
        const spotKey = n.kind === "firstStepPlaceholder" ? "firstStep" : n.id;
        const target: InsertTarget =
          n.kind === "firstStepPlaceholder"
            ? { kind: "trunkEnd" }
            : { kind: "branchStart", stepId: n.branch!.stepId, branchKey: n.branch!.key };
        const node: AddPlaceholderFlowNode = {
          ...base,
          type: "addPlaceholder",
          draggable: false,
          data: {
            kind: n.kind === "firstStepPlaceholder" ? "firstStep" : "emptyBranch",
            height: n.height,
            readOnly,
            dropTarget: dragging && hoverSpot === spotKey,
            onAdd: () => onOpenAddStep(target),
          },
        };
        return node;
      }
      if (n.kind === "when") {
        const node: CardFlowNode = {
          ...base,
          type: "card",
          draggable: false,
          data: {
            stepId: null,
            kindLabel: t("canvas.when"),
            kindIcon: FlashIcon,
            title: triggerTitle,
            subtitle: triggerSubtitle,
            height: n.height,
            selected: triggerSelected,
            readOnly,
            needsDetails: needs.get(null) ?? null,
            ariaLabel: t("canvas.whenLabel", { title: triggerTitle }),
            onClick: onSelectTrigger,
            onKeyDown: cardKeys(null),
          },
        };
        return node;
      }
      const step = findStep(definition, n.stepId ?? null)!;
      const { kind, title, subtitle } = stepTexts[step.id] ?? { kind: "", title: "", subtitle: null };
      const node: CardFlowNode = {
        ...base,
        type: "card",
        draggable: !readOnly && !branches(step),
        data: {
          stepId: step.id,
          kindLabel: kind,
          kindIcon: STEP_TYPE_ICONS[step.type],
          number: n.number,
          title,
          subtitle,
          height: n.height,
          selected: step.id === selectedStepId,
          readOnly,
          skipped: Boolean(step.skipped),
          edited: edited.has(step.id),
          needsDetails: needs.get(step.id) ?? null,
          notConnected: step.type === "SIGN_DOCUMENT" || step.type === "SEND_SURVEY",
          runState: runStates?.[step.id] ?? null,
          ariaLabel: t("canvas.cardLabel", { number: n.number ?? "", kind, title }),
          onClick: () => onSelectStep(step.id),
          onKeyDown: cardKeys(step.id),
        },
      };
      return node;
    });
  }, [layout, definition, stepTexts, triggerTitle, triggerSubtitle, t, readOnly, selectedStepId, triggerSelected, edited, needs, runStates, offerAi,
    dragging, hoverSpot, onChooseTrigger, onOpenAi, onOpenAddStep, onSelectTrigger, onSelectStep, cardKeys]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(computedNodes);
  React.useEffect(() => setNodes((previous) => {
    const measured = new Map(previous.map((n) => [n.id, n.measured]));
    return computedNodes.map((n) => {
      const m = measured.get(n.id);
      return m ? { ...n, measured: m } : n;
    });
  }), [computedNodes, setNodes]);

  const edges = React.useMemo<ConnectorFlowEdge[]>(
    () =>
      layout.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: "connector" as const,
        selectable: false,
        focusable: false,
        data: {
          insert: e.insert,
          branch: e.branch,
          readOnly,
          dragging,
          dropActive: dragging && hoverSpot === `edge:${e.source}->${e.target}`,
          actions,
          onInsert,
          onAllSteps: onOpenAddStep,
        },
      })),
    [layout, readOnly, dragging, hoverSpot, actions, onInsert, onOpenAddStep],
  );

  // ── fitting ──────────────────────────────────────────────────────────────────────────────
  const latest = React.useRef({ layout, insets });
  latest.current = { layout, insets };
  const fit = React.useCallback(
    (duration = 200) => {
      const pane = paneRef.current;
      if (!pane) return;
      const { layout: l, insets: i } = latest.current;
      const viewport = fitViewport(l.bounds, { width: pane.clientWidth, height: pane.clientHeight }, i, { min: ZOOM_MIN, max: 1 });
      void setViewport(viewport, { duration });
    },
    [setViewport],
  );
  const initialised = React.useRef(false);
  React.useEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;
    const observer = new ResizeObserver(() => setPaneWidth(pane.clientWidth));
    observer.observe(pane);
    setPaneWidth(pane.clientWidth);
    return () => observer.disconnect();
  }, []);
  React.useEffect(() => {
    if (!initialised.current) return;
    fit();
  }, [fitKey, fit]);
  // A tree that grows sideways — an approval's two paths, a split's third — is fitted again, or the new path lands
  // under the settings window. Growing downwards is not: the reader scrolls, and the zoom does not jump on every step.
  const widthKey = `${layout.bounds.x}|${layout.bounds.width}`;
  React.useEffect(() => {
    if (!initialised.current) return;
    fit();
  }, [widthKey, fit]);
  const onInit = React.useCallback(() => {
    initialised.current = true;
    fit(0);
  }, [fit]);

  // ── moving a card ────────────────────────────────────────────────────────────────────────
  const spotFor = (node: Node): DropSpot | null => {
    const w = node.width ?? 320;
    const h = node.height ?? 78;
    const centre = { x: node.position.x + w / 2, y: node.position.y + h / 2 };
    const stepId = (node.data as { stepId?: string | null }).stepId ?? "";
    return nearestSpot(layout.spots.filter((s) => !sameplace(s, stepId, layout)), centre);
  };
  const onNodeDragStart: OnNodeDrag<Node> = (_event, node) => setMovingId((node.data as { stepId?: string | null }).stepId ?? null);
  const onNodeDrag: OnNodeDrag<Node> = (_event, node) => setHoverSpot(spotFor(node)?.key ?? null);
  const onNodeDragStop: OnNodeDrag<Node> = (_event, node) => {
    const stepId = (node.data as { stepId?: string | null }).stepId;
    const spot = spotFor(node);
    setMovingId(null);
    setHoverSpot(null);
    setNodes(computedNodes);
    if (stepId && spot) onMove(stepId, spot.target);
  };

  const onNodeClick: NodeMouseHandler<Node> = () => undefined;

  // ── dropping a step from the Add a step window ───────────────────────────────────────────
  const spotAt = (event: React.DragEvent): DropSpot | null =>
    nearestSpot(layout.spots, screenToFlowPosition({ x: event.clientX, y: event.clientY }), 160);
  const onDragOver = (event: React.DragEvent) => {
    if (readOnly || !event.dataTransfer.types.includes(STEP_DRAG_TYPE)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setHoverSpot(spotAt(event)?.key ?? null);
  };
  const onDrop = (event: React.DragEvent) => {
    const type = event.dataTransfer.getData(STEP_DRAG_TYPE) as AutomationStepType;
    setHoverSpot(null);
    if (readOnly || !type) return;
    event.preventDefault();
    const spot = spotAt(event);
    if (spot) onInsert(type, spot.target);
  };

  const selectedNode = layout.nodes.find((n) =>
    triggerSelected ? n.id === TRIGGER_NODE_ID : selectedStepId !== null && n.id === stepNodeId(selectedStepId),
  ) ?? null;

  const flowAriaLabels = useFlowAriaLabels();
  return (
    <div
      ref={paneRef}
      className="relative h-full w-full bg-canvas"
      onDragOver={onDragOver}
      onDragLeave={() => setHoverSpot(null)}
      onDrop={onDrop}
      data-test="automation-canvas"
    >
      <ReactFlow
        ariaLabelConfig={flowAriaLabels}
        aria-label={t("canvas.label")}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onNodeDragStart={readOnly ? undefined : onNodeDragStart}
        onNodeDrag={readOnly ? undefined : onNodeDrag}
        onNodeDragStop={readOnly ? undefined : onNodeDragStop}
        onNodeClick={onNodeClick}
        onPaneClick={onDeselect}
        onInit={onInit}
        nodesDraggable={!readOnly}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        disableKeyboardA11y
        deleteKeyCode={null}
        // A plain wheel or two fingers pan; Ctrl / ⌘ + wheel zooms; the space bar + drag pans (React Flow's default key).
        panOnScroll
        // i18n-exempt: key names, not text
        zoomActivationKeyCode={["Meta", "Control"]}
        minZoom={ZOOM_MIN}
        maxZoom={ZOOM_MAX}
        proOptions={{ hideAttribution: true }}
        className="bg-transparent"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1.5} color="var(--canvas-dot)" />
      </ReactFlow>
      <SelectionLine node={selectedNode} paneWidth={paneWidth} right={insets.right} />
      <ZoomControl onFit={() => fit()} />
      <p className="sr-only">{t("canvas.keyboardHint")}</p>
      <p className="sr-only" aria-live="polite">{announcement ?? ""}</p>
    </div>
  );
}

/** The editor's canvas (`automations-editor` → Layout 4, 9): the cards as a top-down tree, connectors, zoom. */
export function AutomationCanvas(props: AutomationCanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}
