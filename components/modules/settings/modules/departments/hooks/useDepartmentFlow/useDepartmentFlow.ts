"use client";

import { useMemo } from "react";
import { hierarchy, tree } from "d3-hierarchy";
import type { Edge } from "@xyflow/react";

import type { DepartmentTreeNode } from "@/models/departments";
import {
  NODE_H,
  NODE_W,
  type DepartmentFlowNode,
} from "@/components/modules/settings/modules/departments/components/DepartmentCanvas/DepartmentNode";
import {
  COMPANY_NODE_ID,
  type CompanyFlowNode,
} from "@/components/modules/settings/modules/departments/components/DepartmentCanvas/CompanyNode";

const H_SPACING = 24;
const V_SPACING = 72;
const EDGE_STROKE = "var(--brown-300)";

export type OrgFlowNode = CompanyFlowNode | DepartmentFlowNode;

type CompanyInfo = {
  name: string;
  logo: string | null;
  memberCount: number;
};

type Args = {
  tree: DepartmentTreeNode[];
  company: CompanyInfo;
  collapsed: Set<string>;
  selectedId: string | null;
};

type FlowGraph = {
  nodes: OrgFlowNode[];
  edges: Edge[];
};

export function useDepartmentFlow({ tree: data, company, collapsed, selectedId }: Args): FlowGraph {
  return useMemo(() => {
    const nodes: OrgFlowNode[] = [];
    const edges: Edge[] = [];

    const companyRoot = { id: COMPANY_NODE_ID, children: data } as unknown as DepartmentTreeNode;

    const root = hierarchy<DepartmentTreeNode>(companyRoot, (node) => {
      if (collapsed.has(node.id)) return [];
      if (node.id === COMPANY_NODE_ID) return data;
      return node.children ?? [];
    });

    const layoutRoot = tree<DepartmentTreeNode>()
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
            departmentCount: data.length,
            collapsed: collapsed.has(COMPANY_NODE_ID),
            selected: selectedId === COMPANY_NODE_ID,
          },
        });
      } else {
        const department = point.data;
        nodes.push({
          id: department.id,
          type: "department",
          position,
          data: {
            department,
            childCount: department.children?.length ?? 0,
            collapsed: collapsed.has(department.id),
            selected: selectedId === department.id,
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
  }, [data, company.name, company.logo, company.memberCount, collapsed, selectedId]);
}
