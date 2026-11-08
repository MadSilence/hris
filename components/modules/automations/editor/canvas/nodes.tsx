"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Add01Icon, FlashIcon, SparklesIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { NodRing } from "@/components/desact/nod";
import { cn } from "@/lib/cn";
import { StepCard, type StepCardProps } from "./StepCard";

/** The handles a connector hangs on: invisible, top and bottom centre — nobody draws connectors by hand here. */
const Handles: React.FC = () => (
  <>
    <Handle type="target" position={Position.Top} isConnectable={false} className="!pointer-events-none !opacity-0" />
    <Handle type="source" position={Position.Bottom} isConnectable={false} className="!pointer-events-none !opacity-0" />
  </>
);

// ── a step, and the trigger ──────────────────────────────────────────────────────────────────

export type CardNodeData = StepCardProps & { stepId: string | null };
export type CardFlowNode = Node<CardNodeData, "card">;

export function CardNode({ data, dragging }: NodeProps<CardFlowNode>) {
  return (
    <>
      <Handles />
      <StepCard {...data} dragging={dragging || data.dragging} />
    </>
  );
}

// ── the placeholders of a new automation (F2, F0b) ───────────────────────────────────────────

const placeholderClass =
  "flex w-[320px] flex-col items-start rounded-popover border-[1.5px] border-dashed border-accent-ring bg-accent-subtle p-4 text-left transition-colors duration-(--duration-hover) hover:bg-accent-muted outline-none focus-visible:shadow-focus";

export type TriggerPlaceholderData = { height: number; offerAi: boolean; dropTarget?: boolean; onChoose: () => void; onAi: () => void };
export type TriggerPlaceholderFlowNode = Node<TriggerPlaceholderData, "triggerPlaceholder">;

/** "Starts when · Choose what starts it", and under it "or · Describe it to noddo AI" while there is nothing else. */
export function TriggerPlaceholderNode({ data }: NodeProps<TriggerPlaceholderFlowNode>) {
  const t = useTranslations("automationsEditor");
  return (
    <div className="flex w-[320px] flex-col items-center" style={{ height: data.height }}>
      <Handles />
      <button type="button" className={cn(placeholderClass, "h-24")} onClick={data.onChoose} data-test="trigger-placeholder">
        <span className="flex items-center gap-1.5 text-hint text-accent-text">
          <Icon icon={FlashIcon} size="sm" />
          {t("canvas.startsWhen")}
        </span>
        <span className="mt-2 text-card-title text-primary">{t("canvas.chooseTrigger")}</span>
        <span className="mt-1 flex items-center gap-1 text-hint text-tertiary">
          {t.rich("canvas.chooseTriggerHint", {
            plus: () => <Icon icon={Add01Icon} size="sm" className="size-3.5 text-tertiary" />,
          })}
        </span>
      </button>
      {data.offerAi && (
        <>
          <span className="mt-5 text-hint text-tertiary">{t("canvas.or")}</span>
          <Button type="button" variant="secondary" size="sm" className="nodrag mt-3" onClick={data.onAi}>
            <Icon icon={SparklesIcon} size="sm" />
            {t("canvas.describeToAi")}
          </Button>
        </>
      )}
    </div>
  );
}

export type AddPlaceholderData = {
  kind: "firstStep" | "emptyBranch";
  height: number;
  dropTarget?: boolean;
  readOnly: boolean;
  onAdd: () => void;
};
export type AddPlaceholderFlowNode = Node<AddPlaceholderData, "addPlaceholder">;

/** "What should happen next? · Add the first step" (F0b), and an empty path's own way in. */
export function AddPlaceholderNode({ data }: NodeProps<AddPlaceholderFlowNode>) {
  const t = useTranslations("automationsEditor");
  if (data.readOnly) {
    return (
      <div style={{ height: data.height }} className="w-[320px]">
        <Handles />
      </div>
    );
  }
  return (
    <>
      <Handles />
      <button
        type="button"
        style={{ height: data.height }}
        className={cn(placeholderClass, data.kind === "emptyBranch" && "justify-center py-0", data.dropTarget && "bg-accent-muted")}
        onClick={data.onAdd}
        data-test={data.kind === "firstStep" ? "first-step-placeholder" : "empty-path"}
      >
        {data.kind === "firstStep" ? (
          <>
            <span className="text-card-title text-primary">{t("canvas.nextStepTitle")}</span>
            <span className="mt-1 flex items-center gap-1 text-hint text-accent-text">
              <Icon icon={Add01Icon} size="sm" />
              {data.dropTarget ? t("addStep.drop") : t("canvas.nextStepAction")}
            </span>
          </>
        ) : (
          <span className="flex items-center gap-1 text-body text-accent-text">
            <Icon icon={Add01Icon} size="sm" />
            {data.dropTarget ? t("addStep.drop") : t("canvas.emptyPath")}
          </span>
        )}
      </button>
    </>
  );
}

// ── noddo AI adding a step (D1) — built, never drawn while the assistant is not connected (K10) ──

export type AiStepPlaceholderData = { label?: string };
export type AiStepPlaceholderFlowNode = Node<AiStepPlaceholderData, "aiStep">;

export function AiStepPlaceholderNode({ data }: NodeProps<AiStepPlaceholderFlowNode>) {
  const t = useTranslations("automationsEditor");
  return (
    <>
      <Handles />
      <div className={cn(placeholderClass, "h-20 flex-row items-center gap-2")}>
        <NodRing size="sm" label="" />
        <span className="text-body text-secondary">{data.label ?? t("canvas.addingStep")}</span>
      </div>
    </>
  );
}

export const nodeTypes = {
  card: CardNode,
  triggerPlaceholder: TriggerPlaceholderNode,
  addPlaceholder: AddPlaceholderNode,
  aiStep: AiStepPlaceholderNode,
};
