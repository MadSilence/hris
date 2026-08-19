"use client";

import { useMemo } from "react";
import { hierarchy, tree } from "d3-hierarchy";
import type { Edge } from "@xyflow/react";

import type { DepartmentPerson, DepartmentTreeNode } from "@/models/departments";
import {
  BLOCK_W,
  blockHeight,
  type DepartmentBlockFlowNode,
} from "@/components/modules/settings/modules/departments/components/DepartmentBlocksView/DepartmentBlockNode";
import {
  COMPANY_BLOCK_H,
  COMPANY_BLOCK_ID,
  type CompanyBlockFlowNode,
} from "@/components/modules/settings/modules/departments/components/DepartmentBlocksView/CompanyBlockNode";

const H_SPACING = 40;
const V_SPACING = 72;
const EDGE_STROKE = "var(--brown-300)";

export type BlockFlowNode = DepartmentBlockFlowNode | CompanyBlockFlowNode;

type CompanyInfo = {
  name: string;
  logo: string | null;
  peopleAssigned: number;
};

type Args = {
  tree: DepartmentTreeNode[];
  peopleByDepartment: Map<string, DepartmentPerson[]>;
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
export function useDepartmentBlockFlow({
  tree: data,
  peopleByDepartment,
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

    const companyRoot = { id: COMPANY_BLOCK_ID, children: data } as unknown as DepartmentTreeNode;

    const root = hierarchy<DepartmentTreeNode>(companyRoot, (node) => {
      if (node.id === COMPANY_BLOCK_ID) return data;
      if (collapsed.has(node.id)) return [];
      return node.children ?? [];
    });

    const layoutRoot = tree<DepartmentTreeNode>().nodeSize([BLOCK_W + H_SPACING, 1])(root);

    const heightOf = (node: DepartmentTreeNode) =>
      node.id === COMPANY_BLOCK_ID
        ? COMPANY_BLOCK_H
        : blockHeight((peopleByDepartment.get(node.id) ?? []).length, expanded.has(node.id));

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
            departmentCount: data.length,
            dimmed: searchActive,
          },
        });
        return;
      }

      const people = peopleByDepartment.get(node.id) ?? [];
      const isExpanded = expanded.has(node.id);
      const matched = matchedIds?.has(node.id) ?? false;

      nodes.push({
        id: node.id,
        type: "unitBlock",
        position,
        draggable: false,
        data: {
          department: node,
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
    peopleByDepartment,
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
