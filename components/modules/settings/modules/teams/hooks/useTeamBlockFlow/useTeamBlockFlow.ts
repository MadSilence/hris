"use client";

import { useMemo } from "react";
import { hierarchy, tree } from "d3-hierarchy";
import type { Edge } from "@xyflow/react";

import type { TeamPerson, TeamTreeNode } from "@/models/teams";
import {
  BLOCK_W,
  blockHeight,
  type TeamBlockFlowNode,
} from "@/components/modules/settings/modules/teams/components/TeamBlocksView/TeamBlockNode";
import {
  COMPANY_BLOCK_H,
  COMPANY_BLOCK_ID,
  type CompanyBlockFlowNode,
} from "@/components/modules/settings/modules/teams/components/TeamBlocksView/CompanyBlockNode";

const H_SPACING = 40;
const V_SPACING = 72;
const EDGE_STROKE = "var(--brown-300)";

export type BlockFlowNode = TeamBlockFlowNode | CompanyBlockFlowNode;

type CompanyInfo = {
  name: string;
  logo: string | null;
  peopleAssigned: number;
};

type Args = {
  tree: TeamTreeNode[];
  peopleByTeam: Map<string, TeamPerson[]>;
  company: CompanyInfo;
  collapsed: Set<string>;
  expanded: Set<string>;
  selectedId: string | null;
  matchedIds?: Set<string>;
  searchActive?: boolean;
};

type FlowGraph = {
  nodes: BlockFlowNode[];
  edges: Edge[];
};

/**
 * Same tree the chart draws, but every node is a block sized to the people inside it. d3 gives the
 * horizontal placement; rows are stacked by the tallest block on each level so a tall block never
 * overlaps the level below.
 */
export function useTeamBlockFlow({
  tree: data,
  peopleByTeam,
  company,
  collapsed,
  expanded,
  selectedId,
  matchedIds,
  searchActive = false,
}: Args): FlowGraph {
  return useMemo(() => {
    const nodes: BlockFlowNode[] = [];
    const edges: Edge[] = [];
    if (data.length === 0) return { nodes, edges };

    const companyRoot = { id: COMPANY_BLOCK_ID, children: data } as unknown as TeamTreeNode;

    const root = hierarchy<TeamTreeNode>(companyRoot, (node) => {
      if (node.id === COMPANY_BLOCK_ID) return data;
      if (collapsed.has(node.id)) return [];
      return node.children ?? [];
    });

    const layoutRoot = tree<TeamTreeNode>().nodeSize([BLOCK_W + H_SPACING, 1])(root);

    const heightOf = (node: TeamTreeNode) =>
      node.id === COMPANY_BLOCK_ID
        ? COMPANY_BLOCK_H
        : blockHeight((peopleByTeam.get(node.id) ?? []).length, expanded.has(node.id));

    const maxHeightByDepth = new Map<number, number>();
    layoutRoot.each((point) => {
      const h = heightOf(point.data);
      maxHeightByDepth.set(point.depth, Math.max(maxHeightByDepth.get(point.depth) ?? 0, h));
    });

    const yByDepth = new Map<number, number>();
    let offset = 0;
    for (let depth = 0; depth <= Math.max(...maxHeightByDepth.keys(), 0); depth++) {
      yByDepth.set(depth, offset);
      offset += (maxHeightByDepth.get(depth) ?? 0) + V_SPACING;
    }

    layoutRoot.each((point) => {
      const node = point.data;
      const position = { x: point.x, y: yByDepth.get(point.depth) ?? 0 };

      if (node.id === COMPANY_BLOCK_ID) {
        nodes.push({
          id: COMPANY_BLOCK_ID,
          type: "companyBlock",
          position,
          draggable: false,
          data: {
            name: company.name,
            logo: company.logo,
            peopleAssigned: company.peopleAssigned,
            teamCount: data.length,
            dimmed: searchActive,
          },
        });
        return;
      }

      const people = peopleByTeam.get(node.id) ?? [];
      const isExpanded = expanded.has(node.id);
      const matched = matchedIds?.has(node.id) ?? false;

      nodes.push({
        id: node.id,
        type: "unitBlock",
        position,
        draggable: false,
        data: {
          team: node,
          people,
          childCount: node.children?.length ?? 0,
          expanded: isExpanded,
          selected: selectedId === node.id,
          matched,
          dimmed: searchActive && !matched,
          height: blockHeight(people.length, isExpanded),
        },
      });

      const parent = point.parent;
      if (parent) {
        edges.push({
          id: `${parent.data.id}->${node.id}`,
          source: parent.data.id,
          target: node.id,
          type: "smoothstep",
          style: { stroke: EDGE_STROKE, strokeWidth: 1.5 },
        });
      }
    });

    return { nodes, edges };
  }, [
    data,
    peopleByTeam,
    company.name,
    company.logo,
    company.peopleAssigned,
    collapsed,
    expanded,
    selectedId,
    matchedIds,
    searchActive,
  ]);
}
