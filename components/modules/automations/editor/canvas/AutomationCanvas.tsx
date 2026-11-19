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
import {
  allSteps,
  branches,
  APPROVED,
  DECLINED,
  dependsOnSkippable,
  findStep,
  numbers,
  skipsOnFailure,
  type InsertTarget,
} from "@/components/modules/automations/model/tree";
import type { AutomationDefinition, AutomationStepType, StepSpec } from "@/models/automations";
import { TokenText, useAutomationWords } from "../seams";
import { useDocumentTemplates } from "@/components/modules/signing/hooks/useDocumentsSection";
import { cardKeyCommand, isTypingTarget, type CardCommand, type RunCardState } from "../state/editorLogic";
import { edgeTypes, type ConnectorFlowEdge } from "./ConnectorEdge";
import {
  cardHeight,
  fitViewport,
  FIT_ZOOM_MIN,
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
  /** `tokens`: the stored text the title comes from, when it holds a field — drawn with the field as a chip. */
  steps: Record<
    string,
    {
      kind: string;
      title: string;
      subtitle: string | null;
      tokens: string | null;
      /** "Add a question" on a split with none (S10b). */
      muted: boolean;
      /** S8b, S8c: what a failure does to it, as a line of its own. */
      note: { text: string; tone: "skip" | "pending" } | null;
    }
  >;
  trigger: string;
  triggerSubtitle: string | null;
};

/** What every card says, from the words of the settings part. */
const cardTexts = (
  definition: AutomationDefinition,
  words: ReturnType<typeof useAutomationWords>,
  t: ReturnType<typeof useTranslations<"automationsEditor">>,
  signMeta: (step: StepSpec) => string | null,
): CardTexts => {
  const steps: CardTexts["steps"] = {};
  const numbered = numbers(definition);
  for (const step of allSteps(definition)) {
    const kind = words.stepKind(step);
    const muted = step.type === "SPLIT" && !step.question?.trim();
    const on = dependsOnSkippable(definition, step);
    const note: CardTexts["steps"][string]["note"] = skipsOnFailure(step)
      ? { text: t("canvas.skippedIfFails"), tone: "skip" }
      : on
        ? { text: t("canvas.skippedWith", { number: numbered[on.id] ?? "" }), tone: "pending" }
        : null;
    steps[step.id] = {
      kind,
      title: muted ? t("canvas.addQuestion") : words.stepTitle(step) || kind,
      subtitle: [signMeta(step), words.stepSubtitle(step)].filter(Boolean).join(" · ") || null,
      tokens: titleTokens(step),
      muted,
      note,
    };
  }
  return {
    steps,
    trigger: definition.trigger ? words.triggerTitle(definition.trigger) : "",
    triggerSubtitle: definition.trigger ? words.triggerSubtitle(definition.trigger) : null,
  };
};

/**
 * The stored text a card's title is made of, when it holds a field (`{fullName}`): a task's title, an email's subject.
 * The card draws the field as a token, not as its name in plain words (the designers' Words, 2026-11-18).
 */
const titleTokens = (step: StepSpec): string | null => {
  const source = step.type === "CREATE_TASK" ? step.title : step.type === "SEND_EMAIL" ? step.subject : null;
  return source && /\{[A-Za-z][A-Za-z0-9_]*\}/.test(source) ? source.trim() : null;
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
  /** S10c: the paths of a split with no condition, as `<stepId>:<pathKey>` — their labels are drawn in red. */
  pathErrors?: Set<string>;
  /** "· edited" on a live automation. */
  edited: Set<string>;
  runStates: Record<string, RunCardState> | null;
  /** A new automation: "or · Describe it to noddo AI" under the placeholder. */
  offerAi: boolean;
  /** What the windows cover, so a fit lands in the part left free. */
  insets: CanvasInsets;
  /** The settings window on the right, when one is open: the selection line ends on its edge (C1b). */
  windowSpan?: WindowSpan | null;
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

/**
 * − 100 % + (the designers' fixes B6): 130 × 42, padding 4, gap 4, radius 10, level 2; the buttons 32 × 32 radius 8;
 * the number is text, not a button — 48 wide, 12/20 tabular. Steps of 10 %.
 */
const ZoomControl: React.FC = () => {
  const t = useTranslations("automationsEditor");
  const { zoom } = useViewport();
  const { zoomTo } = useReactFlow();
  const step = (delta: number) => {
    const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round((zoom + delta) * 10) / 10));
    void zoomTo(next, { duration: 150 });
  };
  const button =
    "flex size-8 items-center justify-center rounded-control text-secondary hover:bg-mist hover:text-primary outline-none focus-visible:shadow-focus";
  return (
    <div
      role="group"
      aria-label={t("canvas.zoom.label")}
      className="absolute right-6 bottom-6 z-10 flex h-[42px] items-center gap-1 rounded-popover border border-divider bg-card p-1 shadow-popover"
    >
      <button type="button" aria-label={t("canvas.zoom.out")} onClick={() => step(-0.1)} className={button}>
        <Icon icon={MinusSignIcon} size="sm" />
      </button>
      <span aria-live="polite" className="w-12 text-center text-hint leading-5 text-secondary tabular-nums">
        {t("canvas.zoom.value", { value: Math.round(zoom * 100) })}
      </span>
      <button type="button" aria-label={t("canvas.zoom.in")} onClick={() => step(0.1)} className={button}>
        <Icon icon={Add01Icon} size="sm" />
      </button>
    </div>
  );
};

/** Where the step window stands, in the pane's own coordinates: its left edge from the pane's right, its top and bottom. */
export type WindowSpan = { right: number; top: number; bottom: number };

/** The vertical middle of a card on screen. */
const lineYOf = (node: { y: number; height: number }, viewport: { y: number; zoom: number }) =>
  (node.y + node.height / 2) * viewport.zoom + viewport.y;

/**
 * The dashed line from the selected card to the settings window (the designers' fixes C1b): at the card's vertical
 * middle, from 3 px right of the card — outside its focus ring — to the window's left edge exactly; 1.5 px of the
 * accent ring, dashed like a CSS border. It never ends in empty space: past the window's height it is not drawn (the
 * canvas pans the card back on selection, `CanvasInner`).
 */
const SelectionLine: React.FC<{ node: { x: number; y: number; width: number; height: number } | null; paneWidth: number; span: WindowSpan | null }> = ({
  node,
  paneWidth,
  span,
}) => {
  const { x, y, zoom } = useViewport();
  if (!node || !span) return null;
  const startX = (node.x + node.width) * zoom + x + 3;
  const endX = paneWidth - span.right;
  const lineY = lineYOf(node, { y, zoom });
  if (endX - startX < 8 || lineY < span.top || lineY > span.bottom) return null;
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 z-[1] h-full w-full overflow-visible" data-test="selection-line">
      <line x1={startX} y1={lineY} x2={endX} y2={lineY} stroke="var(--accent-ring)" strokeWidth={1.5} strokeDasharray="4.5 4.5" />
    </svg>
  );
};

function CanvasInner(props: AutomationCanvasProps) {
  const {
    definition, actions, readOnly, selectedStepId, triggerSelected, needs, pathErrors, edited, runStates, offerAi, insets, windowSpan = null, fitKey,
    paletteDrag, announcement, onSelectStep, onSelectTrigger, onDeselect, onChooseTrigger, onOpenAi, onOpenAddStep, onInsert,
    onMove, onCardCommand,
  } = props;
  const t = useTranslations("automationsEditor");
  const words = useAutomationWords();
  const { setViewport, getViewport, screenToFlowPosition } = useReactFlow();
  const paneRef = React.useRef<HTMLDivElement>(null);
  const [paneWidth, setPaneWidth] = React.useState(0);
  const [hoverSpot, setHoverSpot] = React.useState<string | null>(null);
  const [movingId, setMovingId] = React.useState<string | null>(null);

  // The words hook hands out a new object on every render; what the cards say is kept only when it changes, or the
  // nodes would be rebuilt — and React Flow's state set — on every render, for ever.
  // A01, S9: a signing step's meta is its template's — who signs in order and the days to sign.
  const tSettings = useTranslations("automationsSettings");
  const hasSign = allSteps(definition).some((s) => s.type === "SIGN_DOCUMENT");
  const { data: templates } = useDocumentTemplates(hasSign);
  const signMeta = (step: StepSpec): string | null => {
    if (step.type !== "SIGN_DOCUMENT") return null;
    const template = templates?.find((x) => x.id === step.documents?.[0]);
    if (!template) return null;
    const signers = [...(template.signers ?? [])]
      .sort((a, b) => (a.order ?? 1) - (b.order ?? 1))
      .map((x, i) => {
        const name = x.label?.trim() || tSettings(`sign.kind.${x.kind}`);
        return i === 0 ? name : name.charAt(0).toLocaleLowerCase() + name.slice(1);
      });
    const who = signers.length === 0 ? "" : signers.length === 1 ? signers[0] : t("canvas.signersInOrder", { first: signers[0], then: signers.slice(1).join(", ") });
    return t("canvas.signMeta", { signers: who, days: template.envelopeExpiryDays });
  };
  const texts = useStable(cardTexts(definition, words, t, signMeta));
  const { steps: stepTexts, trigger: triggerTitle, triggerSubtitle } = texts;
  const hasExtraLine = React.useCallback(
    (step: StepSpec) =>
      Boolean(needs.get(step.id)) ||
      Boolean(stepTexts[step.id]?.note) ||
      runStates?.[step.id] === "failed" ||
      runStates?.[step.id] === "notStarted",
    [needs, runStates, stepTexts],
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
            kind:
              n.kind === "firstStepPlaceholder"
                ? "firstStep"
                : n.branch && n.branch.key !== APPROVED && n.branch.key !== DECLINED
                  ? "emptyPath"
                  : "emptyBranch",
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
      const { kind, title, subtitle, tokens, muted, note } = stepTexts[step.id] ?? { kind: "", title: "", subtitle: null, tokens: null, muted: false, note: null };
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
          titleNode: tokens ? <TokenText value={tokens} className="whitespace-normal" /> : undefined,
          subtitle,
          titleMuted: muted,
          note,
          height: n.height,
          selected: step.id === selectedStepId,
          readOnly,
          skipped: Boolean(step.skipped),
          edited: edited.has(step.id),
          needsDetails: needs.get(step.id) ?? null,
          notConnected: step.type === "SEND_SURVEY",
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
          pathError: Boolean(e.branch && pathErrors?.has(`${e.branch.stepId}:${e.branch.key}`)),
          readOnly,
          dragging,
          dropActive: dragging && hoverSpot === `edge:${e.source}->${e.target}`,
          actions,
          onInsert,
          onAllSteps: onOpenAddStep,
        },
      })),
    [layout, readOnly, dragging, hoverSpot, actions, onInsert, onOpenAddStep, pathErrors],
  );

  // ── fitting ──────────────────────────────────────────────────────────────────────────────
  const selectedNode = layout.nodes.find((n) =>
    triggerSelected ? n.id === TRIGGER_NODE_ID : selectedStepId !== null && n.id === stepNodeId(selectedStepId),
  ) ?? null;

  const selectedRef = React.useRef(selectedNode);
  selectedRef.current = selectedNode;
  const spanRef = React.useRef(windowSpan);
  spanRef.current = windowSpan;
  /** C1b: the viewport moved up or down so the selected card's middle lands within the settings window's height. */
  const withSelectionInWindow = (viewport: { x: number; y: number; zoom: number }) => {
    const node = selectedRef.current;
    const span = spanRef.current;
    if (!node || !span) return viewport;
    const lineY = lineYOf(node, viewport);
    const margin = Math.min(24, (span.bottom - span.top) / 2);
    const target = Math.min(Math.max(lineY, span.top + margin), span.bottom - margin);
    return Math.abs(target - lineY) < 1 ? viewport : { ...viewport, y: viewport.y + (target - lineY) };
  };
  const latest = React.useRef({ layout, insets });
  latest.current = { layout, insets };
  const fit = React.useCallback(
    (duration = 200) => {
      const pane = paneRef.current;
      if (!pane) return;
      const { layout: l, insets: i } = latest.current;
      const viewport = fitViewport(l.bounds, { width: pane.clientWidth, height: pane.clientHeight }, i, { min: FIT_ZOOM_MIN, max: 1 });
      // A refit while a step is selected keeps it level with the window (C1b) — walked 2026-11-19: the sentence card
      // growing to two lines on an insert refitted the flow and left the new step below the window, with no line.
      void setViewport(withSelectionInWindow(viewport), { duration });
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
  // The fits follow their keys only. `fit` is rebuilt whenever React Flow hands out a new `setViewport`, and an effect
  // keyed on it refitted at random — walked 2026-11-19, it undid the C1b pan right after a step was inserted.
  const fitRef = React.useRef(fit);
  fitRef.current = fit;
  React.useEffect(() => {
    if (!initialised.current) return;
    fitRef.current();
  }, [fitKey]);
  // A tree that grows sideways — an approval's two paths, a split's third — is fitted again, or the new path lands
  // under the settings window. Growing downwards is not: the reader scrolls, and the zoom does not jump on every step.
  const widthKey = `${layout.bounds.x}|${layout.bounds.width}`;
  React.useEffect(() => {
    if (!initialised.current) return;
    fitRef.current();
  }, [widthKey]);
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

  // C1b: a step is selected — the canvas pans so the card's middle lands within the window's height, and the line ends
  // on the window. The flow moves up, past the top edge if it has to. Once per selection and window size; a pan by hand
  // afterwards is the reader's own.
  // A refit keeps the selection level with the window itself (`fit`), so this covers a new selection or window size.
  const panKey = selectedNode && windowSpan ? `${selectedNode.id}|${selectedNode.y}|${windowSpan.top}|${windowSpan.bottom}` : null;
  React.useEffect(() => {
    if (!panKey) return;
    // After the fit that opening the window starts (200 ms), so the pan is measured against where the fit left it.
    const timer = window.setTimeout(() => {
      if (!initialised.current) return;
      const viewport = getViewport();
      const next = withSelectionInWindow(viewport);
      if (next !== viewport) void setViewport(next, { duration: 200 });
    }, 250);
    return () => window.clearTimeout(timer);
   
  }, [panKey, getViewport, setViewport]);

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
      <SelectionLine node={selectedNode} paneWidth={paneWidth} span={windowSpan} />
      <ZoomControl />
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
