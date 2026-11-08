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
        "flex w-12 flex-col gap-1 rounded-card bg-card p-1 shadow-raised",
        open !== null && "rounded-r-none shadow-popover",
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
 * The tool window (Layout 6): joined to the block like an ear — no corner where they meet — full height, 320 (noddo
 * AI 400). The runs part's windows bring their own frame; this one is for the editor's own tools.
 */
export const ToolWindowFrame: React.FC<{
  title: string;
  width: 320 | 400;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ title, width, onClose, children, footer }) => {
  const t = useTranslations("automationsEditor");
  return (
    <section
      aria-label={title}
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-card rounded-tl-none bg-card shadow-popover",
        width === 320 ? "w-[320px]" : "w-[400px]",
      )}
    >
      <header className="flex items-center gap-2 border-b border-divider px-5 py-3">
        <h2 className="min-w-0 flex-1 truncate text-card-title text-primary">{title}</h2>
        <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} aria-label={t("tools.close")}>
          <Icon icon={Cancel01Icon} size="sm" />
        </Button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
      {footer}
    </section>
  );
};
