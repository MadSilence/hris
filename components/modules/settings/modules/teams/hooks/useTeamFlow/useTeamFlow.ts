"use client";

import { useMemo } from "react";
import { hierarchy, tree } from "d3-hierarchy";
import type { Edge } from "@xyflow/react";

import type { TeamTreeNode } from "@/models/teams";
import {
  NODE_H,
  NODE_W,
  type TeamFlowNode,
} from "@/components/modules/settings/modules/teams/components/TeamCanvas/TeamNode";
import {
  COMPANY_NODE_ID,
  type CompanyFlowNode,
} from "@/components/modules/settings/modules/teams/components/TeamCanvas/CompanyNode";

const H_SPACING = 24;
const V_SPACING = 72;
const EDGE_STROKE = "var(--brown-300)";

export type OrgFlowNode = CompanyFlowNode | TeamFlowNode;

type CompanyInfo = {
  name: string;
  logo: string | null;
  memberCount: number;
};

type Args = {
  tree: TeamTreeNode[];
  company: CompanyInfo;
  collapsed: Set<string>;
  selectedId: string | null;
  /** Search hits. While a search is running, everything else is dimmed. */
  matchedIds?: Set<string>;
  searchActive?: boolean;
};

type FlowGraph = {
  nodes: OrgFlowNode[];
  edges: Edge[];
};

export function useTeamFlow({
  tree: data,
  company,
  collapsed,
  selectedId,
  matchedIds,
  searchActive = false,
}: Args): FlowGraph {
  return useMemo(() => {
    const nodes: OrgFlowNode[] = [];
    const edges: Edge[] = [];

    const companyRoot = { id: COMPANY_NODE_ID, children: data } as unknown as TeamTreeNode;

    const root = hierarchy<TeamTreeNode>(companyRoot, (node) => {
      if (collapsed.has(node.id)) return [];
      if (node.id === COMPANY_NODE_ID) return data;
      return node.children ?? [];
    });

    const layoutRoot = tree<TeamTreeNode>()
      .nodeSize([NODE_W + H_SPACING, NODE_H + V_SPACING])(root);

    layoutRoot.each((point) => {
      const position = { x: point.x, y: point.y };

      if (point.data.id === COMPANY_NODE_ID) {
        nodes.push({
          id: COMPANY_NODE_ID,
          type: "company",
          position,
          data: {
            name: company.name,
            logo: company.logo,
            memberCount: company.memberCount,
            teamCount: data.length,
            collapsed: collapsed.has(COMPANY_NODE_ID),
            selected: selectedId === COMPANY_NODE_ID,
            dimmed: searchActive,
          },
        });
      } else {
        const team = point.data;
        nodes.push({
          id: team.id,
          type: "team",
          position,
          data: {
            team,
            childCount: team.children?.length ?? 0,
            collapsed: collapsed.has(team.id),
            selected: selectedId === team.id,
            matched: matchedIds?.has(team.id) ?? false,
            dimmed: searchActive && !(matchedIds?.has(team.id) ?? false),
          },
        });
      }

      const parent = point.parent;
      if (parent) {
        edges.push({
          id: `${parent.data.id}->${point.data.id}`,
          source: parent.data.id,
          target: point.data.id,
          type: "default",
          style: { stroke: EDGE_STROKE, strokeWidth: 1.5 },
        });
      }
    });

    return { nodes, edges };
  }, [data, company.name, company.logo, company.memberCount, collapsed, selectedId, matchedIds, searchActive]);
}
