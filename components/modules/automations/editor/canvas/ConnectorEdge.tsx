"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, Position, type Edge, type EdgeProps } from "@xyflow/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/desact/popover";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/cn";
import { letter, type InsertTarget } from "@/components/modules/automations/model/tree";
import type { AutomationStepType } from "@/models/automations";
import { BAR_DROP, type BranchLabel } from "./layout";
import { QuickAdd } from "./QuickAdd";

export type ConnectorData = {
  insert: InsertTarget | null;
  branch: BranchLabel | null;
  readOnly: boolean;
  /** A step is being dragged: the "+" turns into a drop spot. */
  dragging: boolean;
  /** The drag would land on this connector. */
  dropActive: boolean;
  actions: AutomationStepType[];
  onInsert: (type: AutomationStepType, target: InsertTarget) => void;
  onAllSteps: (target: InsertTarget) => void;
};
export type ConnectorFlowEdge = Edge<ConnectorData, "connector">;

/** A branch's pill: Approved, Declined, a path's name (`automations-editor` → Layout 4). */
export const BranchPill: React.FC<{ label: BranchLabel }> = ({ label }) => {
  const t = useTranslations("automationsEditor");
  if (label.kind === "APPROVED") return <StatusBadge status="approved" size="sm" label={t("canvas.approved")} />;
  if (label.kind === "DECLINED") return <StatusBadge status="declined" size="sm" label={t("canvas.declined")} />;
  const text = label.name?.trim() || (label.kind === "OTHERWISE" ? t("canvas.otherwise") : t("canvas.pathUnnamed", { letter: letter(label.index) }));
  return (
    <span className="inline-flex h-5 max-w-40 items-center truncate rounded-pill border border-divider bg-card px-2 text-hint font-semibold text-secondary">
      {text}
    </span>
  );
};

/**
 * A connector (§ 13.8): 1.5 px in the strong border colour, rounded corners; into a path, the bar runs under the
 * branch point and the path's pill sits on its own segment. The "+" on it opens the quick add (D4).
 */
export function ConnectorEdge({ id, sourceX, sourceY, targetX, targetY, data }: EdgeProps<ConnectorFlowEdge>) {
  const t = useTranslations("automationsEditor");
  const [open, setOpen] = React.useState(false);
  const intoPath = Boolean(data?.branch);
  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    borderRadius: 8,
    centerY: intoPath ? sourceY + BAR_DROP : undefined,
  });
  const plus = intoPath ? { x: targetX, y: targetY - 18 } : { x: targetX, y: (sourceY + targetY) / 2 };
  const pill = { x: targetX, y: sourceY + BAR_DROP + 22 };
  const insert = data?.insert ?? null;

  return (
    <>
      <BaseEdge id={id} path={path} style={{ stroke: "var(--border-strong)", strokeWidth: 1.5 }} />
      <EdgeLabelRenderer>
        {data?.branch && (
          <div
            className="nodrag nopan pointer-events-none absolute"
            style={{ transform: `translate(-50%, -50%) translate(${pill.x}px, ${pill.y}px)` }}
          >
            <BranchPill label={data.branch} />
          </div>
        )}
        {insert && !data?.readOnly && (
          <div
            className="nodrag nopan pointer-events-auto absolute"
            style={{ transform: `translate(-50%, -50%) translate(${plus.x}px, ${plus.y}px)` }}
          >
            {data?.dragging ? (
              <span
                data-test="drop-spot"
                className={cn(
                  "flex items-center justify-center rounded-pill border-[1.5px] border-dashed border-accent-ring bg-accent-subtle text-hint text-accent-text",
                  data.dropActive ? "h-8 w-44" : "size-5",
                )}
              >
                {data.dropActive && t("addStep.drop")}
              </span>
            ) : (
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label={t("addStep.quickAdd")}
                    className="flex size-5 items-center justify-center rounded-pill border border-divider bg-card text-tertiary transition-colors duration-(--duration-hover) hover:border-accent hover:text-accent-text focus-visible:shadow-focus outline-none"
                  >
                    <Icon icon={Add01Icon} size="sm" className="size-3" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="center" className="w-64 p-2">
                  <QuickAdd
                    actions={data?.actions ?? []}
                    onPick={(type) => {
                      setOpen(false);
                      data?.onInsert(type, insert);
                    }}
                    onAllSteps={() => {
                      setOpen(false);
                      data?.onAllSteps(insert);
                    }}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}

export const edgeTypes = { connector: ConnectorEdge };
