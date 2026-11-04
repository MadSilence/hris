"use client";

import React from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { ArrowUp01Icon, Folder01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { PersonChip } from "@/components/ui/PersonChip";
import { cn } from "@/lib/cn";
import {
  personDisplayName,
  personInitials,
} from "@/components/modules/settings/modules/departments/utils/personDisplay";
import type { DepartmentPerson, DepartmentTreeNode } from "@/models/departments";

import { useDepartmentBlocks } from "./DepartmentBlocksContext";
import { StatusBadge } from "@/components/ui/StatusBadge";

/**
 * Every measurement the layout needs. The card is a fixed box on purpose: the block's height is
 * computed, not measured, so any drift between these numbers and the rendered card shows up as
 * people clipped at the bottom of a block.
 */
export const CARD_W = 100;
export const CARD_H = 96;
export const CARD_GAP = 8;
export const CHIP_COLS = 3;
export const CHIP_ROWS = 4;
/** 3 × 4 tiles fit in a block before the rest folds behind “+N more”. */
export const VISIBLE_CHIPS = CHIP_COLS * CHIP_ROWS;

export const BODY_PADDING = 12;
export const HEADER_H = 46;
export const MORE_ROW_H = 24;
export const EMPTY_ROW_H = 22;
export const BLOCK_W = CHIP_COLS * CARD_W + (CHIP_COLS - 1) * CARD_GAP + BODY_PADDING * 2;

export function blockHeight(peopleCount: number, expanded: boolean): number {
  const shown = expanded ? peopleCount : Math.min(peopleCount, VISIBLE_CHIPS);
  const rows = Math.ceil(shown / CHIP_COLS);
  const grid = rows > 0 ? rows * CARD_H + (rows - 1) * CARD_GAP : EMPTY_ROW_H;
  const moreRow = peopleCount > VISIBLE_CHIPS ? MORE_ROW_H : 0;
  return HEADER_H + BODY_PADDING * 2 + grid + moreRow;
}

export type DepartmentBlockNodeData = {
  department: DepartmentTreeNode;
  people: DepartmentPerson[];
  childCount: number;
  expanded: boolean;
  selected: boolean;
  matched: boolean;
  dimmed: boolean;
  height: number;
};

export type DepartmentBlockFlowNode = Node<DepartmentBlockNodeData, "unitBlock">;

const hiddenHandle = "!h-1.5 !w-1.5 !min-w-0 !border-0 !bg-transparent";

export function DepartmentBlockNode({ data }: NodeProps<DepartmentBlockFlowNode>) {
  const { department, people, childCount, expanded, selected, matched, dimmed, height } = data;
  const ctx = useDepartmentBlocks();

  const isArchived = department.status === "ARCHIVED";
  const visible = expanded ? people : people.slice(0, VISIBLE_CHIPS);
  const hidden = people.length - visible.length;
  const branchCollapsed = ctx.isBranchCollapsed(department.id);

  const card = (
    <div
      style={{ width: BLOCK_W, height }}
      className={cn(
        "nopan flex flex-col rounded-popover border bg-card transition-shadow",
        selected ? "border-accent shadow-raised ring-1 ring-accent-ring" : "border-divider shadow-raised",
        matched && "bg-search-highlight ring-2 ring-strong ring-inset",
        dimmed && "opacity-35",
        isArchived && "border-dashed bg-subtle/60",
      )}
    >
      <Handle type="target" position={Position.Top} className={hiddenHandle} isConnectable={false} />

      <header className="flex flex-none items-center gap-2 px-3" style={{ height: HEADER_H }}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            ctx.onSelectDepartment(department.id);
          }}
          className="nodrag flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <Icon icon={Folder01Icon} size="sm" className="flex-none text-tertiary" />
          <span className="truncate text-body font-semibold text-primary">{department.name}</span>
          {department.code && (
            <span className="flex-none rounded-tag border border-divider bg-subtle px-1 py-0.5 font-mono text-hint leading-none text-tertiary">
              {department.code}
            </span>
          )}
          {isArchived && (
            <StatusBadge status="archived" className="flex-none px-1 py-0.5 text-hint leading-none" />
          )}
        </button>

        <span className="flex-none whitespace-nowrap text-hint text-tertiary">
          {department.memberCount} here
          {department.totalPeople !== department.memberCount && ` · ${department.totalPeople} total`}
        </span>
      </header>

      <div className="min-h-0 flex-1 px-3 pb-3">
        {people.length === 0 ? (
          <p className="text-hint text-tertiary">No people here yet.</p>
        ) : (
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${CHIP_COLS}, ${CARD_W}px)`,
              gap: CARD_GAP,
            }}
          >
            {visible.map((person) =>
              ctx.renderPersonChip ? (
                <React.Fragment key={person.id}>
                  {ctx.renderPersonChip(person, department)}
                </React.Fragment>
              ) : (
                <PersonChip
                  key={person.id}
                  variant="card"
                  name={personDisplayName(person)}
                  jobName={person.jobName}
                  avatarUrl={person.avatarUrl}
                  initials={personInitials(person)}
                  selected={ctx.selectedPersonId === person.id}
                  matched={ctx.matchedPersonIds.has(person.id)}
                  archived={person.status !== "ACTIVE"}
                  badge={department.leadId === person.id ? "Lead" : undefined}
                  onClick={() => ctx.onSelectPerson(person)}
                  className="nodrag"
                  style={{ height: CARD_H }}
                />
              ),
            )}
          </div>
        )}

        {people.length > VISIBLE_CHIPS && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              ctx.onToggleExpanded(department.id);
            }}
            style={{ height: MORE_ROW_H }}
            className="nodrag flex items-center text-hint text-tertiary underline-offset-2 hover:text-primary hover:underline"
          >
            {expanded ? "Show less" : `+${hidden} more`}
          </button>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className={hiddenHandle} isConnectable={false} />

      {childCount > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            ctx.onToggleCollapse(department.id);
          }}
          className="nodrag absolute -bottom-3 left-1/2 z-10 flex h-6 min-w-6 -translate-x-1/2 items-center justify-center rounded-pill border border-divider bg-card px-1.5 text-tertiary shadow-card transition-colors hover:border-field hover:text-primary"
          aria-label={branchCollapsed ? `Expand ${childCount} sub-departments` : "Collapse"}
          title={branchCollapsed ? `Expand ${childCount} sub-departments` : "Collapse"}
        >
          {branchCollapsed ? (
            <span className="text-hint font-semibold leading-none">{childCount}</span>
          ) : (
            <Icon icon={ArrowUp01Icon} size="sm" />
          )}
        </button>
      )}
    </div>
  );

  return (
    <div className="relative">{ctx.renderDropZone ? ctx.renderDropZone(department, card) : card}</div>
  );
}
