"use client";

import { useMemo } from "react";
import { hierarchy, tree } from "d3-hierarchy";
import type { Edge } from "@xyflow/react";

import {
  NODE_H,
  NODE_W,
  type UserFlowNode,
} from "@/components/modules/organization/orgChart/components/OrgChartCanvas/UserNode";
import type { OrgTreeNode } from "@/components/modules/organization/orgChart/utils/buildOrgTree";

const H_SPACING = 40;
const V_SPACING = 72;
const EDGE_STROKE = "var(--brown-300)";

type LayoutNode = { user: OrgTreeNode["user"] | null; children: OrgTreeNode[] };

type Args = {
  roots: OrgTreeNode[];
  collapsed: Set<string>;
  selectedId: string | null;
};

type FlowGraph = {
  nodes: UserFlowNode[];
  edges: Edge[];
};

export function useOrgChartFlow({ roots, collapsed, selectedId }: Args): FlowGraph {
  return useMemo(() => {
    const nodes: UserFlowNode[] = [];
    const edges: Edge[] = [];

    if (roots.length === 0) return { nodes, edges };

    const virtualRoot: LayoutNode = { user: null, children: roots };

    const root = hierarchy<LayoutNode>(virtualRoot, (node) => {
      if (node.user && collapsed.has(node.user.id)) return [];
      return node.children as LayoutNode[];
    });

    const layoutRoot = tree<LayoutNode>()
      .nodeSize([NODE_W + H_SPACING, NODE_H + V_SPACING])(root);

    layoutRoot.each((point) => {
      const user = point.data.user;
      if (!user) return; // skip the synthetic root

      nodes.push({
        id: user.id,
        type: "user",
        position: { x: point.x, y: point.y },
        data: {
          user,
          childCount: point.data.children?.length ?? 0,
          collapsed: collapsed.has(user.id),
          selected: selectedId === user.id,
        },
      });

      const parentUser = point.parent?.data.user;
      if (parentUser) {
        edges.push({
          id: `${parentUser.id}->${user.id}`,
          source: parentUser.id,
          target: user.id,
          type: "default",
          style: { stroke: EDGE_STROKE, strokeWidth: 1.5 },
        });
      }
    });

    return { nodes, edges };
  }, [roots, collapsed, selectedId]);
}
