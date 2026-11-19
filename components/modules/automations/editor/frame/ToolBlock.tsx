"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Cancel01Icon, Clock01Icon, Layers01Icon, SparklesIcon, AddSquareIcon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/desact/button";
import { Icon, type IconSvgElement } from "@/components/desact/icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/desact/tooltip";
import { cn } from "@/lib/cn";

/** The windows of the left: the five tools, and what opens there without a button of its own. */
export type ToolId = "ai" | "add" | "who" | "runs" | "versions" | "trigger" | "test";
export type BlockTool = Extract<ToolId, "ai" | "add" | "who" | "runs" | "versions">;

const TOOLS: { id: BlockTool; icon: IconSvgElement }[] = [
  { id: "ai", icon: SparklesIcon },
  { id: "add", icon: AddSquareIcon },
  { id: "who", icon: UserGroupIcon },
  { id: "runs", icon: Clock01Icon },
  { id: "versions", icon: Layers01Icon },
];

/**
 * The canvas tool block (`automations-editor` → Layout 5): floating top left, five icon buttons with a light tooltip
 * (title + one line). In read mode noddo AI and Add a step are hidden. The open tool's button is pressed.
 */
export const ToolBlock: React.FC<{
  open: ToolId | null;
  readOnly: boolean;
  disabled?: Partial<Record<BlockTool, boolean>>;
  onToggle: (tool: BlockTool) => void;
}> = ({ open, readOnly, disabled = {}, onToggle }) => {
  const t = useTranslations("automationsEditor");
  const tools = readOnly ? TOOLS.filter((tool) => tool.id !== "ai" && tool.id !== "add") : TOOLS;
  return (
    <div
      role="toolbar"
      aria-orientation="vertical"
      aria-label={t("tools.label")}
      className={cn(
        "flex w-[52px] flex-col gap-2 rounded-card border border-divider bg-card p-1.5 shadow-raised",
        open !== null && "rounded-r-none shadow-dialog",
      )}
    >
      {tools.map((tool) => {
        const pressed = open === tool.id || (tool.id === "add" && open === "trigger");
        return (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={t(`tools.${tool.id}.title`)}
                aria-pressed={pressed}
                disabled={disabled[tool.id]}
                onClick={() => onToggle(tool.id)}
                className={cn(
                  "flex size-10 items-center justify-center rounded-control text-secondary outline-none transition-colors duration-(--duration-hover)",
                  "hover:bg-mist hover:text-primary focus-visible:shadow-focus disabled:text-disabled disabled:hover:bg-card",
                  pressed && "bg-accent-muted text-accent-text hover:bg-accent-muted hover:text-accent-text",
                )}
              >
                <Icon icon={tool.icon} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-56">
              <span className="block font-medium">{t(`tools.${tool.id}.title`)}</span>
              <span className="block">{t(`tools.${tool.id}.hint`)}</span>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
};

/**
 * The tool window (Layout 6, the designers' fixes E1–E2): joined to the block like an ear — no corner where they meet —
 * full height, 320 (noddo AI 400), a hairline and level 3. The header is 53 high with × at its right. `footer` is pinned
 * to the window's bottom (Add a step's hint, noddo AI's composer). The runs part's windows bring the same frame.
 */
export const ToolWindowFrame: React.FC<{
  title: string;
  width: 320 | 400;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** The body's own padding; Add a step and noddo AI lay out their own. */
  bodyClassName?: string;
}> = ({ title, width, onClose, children, footer, bodyClassName = "px-5 py-4" }) => {
  const t = useTranslations("automationsEditor");
  return (
    <section
      aria-label={title}
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-card rounded-tl-none border border-divider bg-card shadow-dialog",
        width === 320 ? "w-[320px]" : "w-[400px]",
      )}
    >
      <ToolWindowHeader title={title} onClose={onClose} closeLabel={t("tools.close")} />
      <div className={cn("min-h-0 flex-1 overflow-y-auto", bodyClassName)}>{children}</div>
      {footer}
    </section>
  );
};

/** E2: 53 high, padding 0 8 0 16, the title 15/22 600, × 32 with a 20 icon, a hairline under it. */
export const ToolWindowHeader: React.FC<{ title: React.ReactNode; onClose: () => void; closeLabel: string }> = ({ title, onClose, closeLabel }) => (
  <header className="flex h-[53px] shrink-0 items-center gap-2 border-b border-divider pr-2 pl-4">
    <h2 className="min-w-0 flex-1 truncate text-card-title text-primary">{title}</h2>
    <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} aria-label={closeLabel}>
      <Icon icon={Cancel01Icon} />
    </Button>
  </header>
);
