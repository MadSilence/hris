"use client";

import React, { useState } from "react";
import type { DepartmentNode } from "./components/DepartmentTree";
import { DepartmentTree } from "./components/DepartmentTree";
import { DepartmentDetailsPanel } from "./components/DepartmentDetailsPanel";

const initialData: DepartmentNode[] = [
  {
    id: "eng",
    name: "Engineering",
    members: 42,
    about: "Builds and maintains the product, infrastructure, and platform.",
    founded: "2018",
    directReports: 6,
    responsibilities: [
      "Product development and maintenance",
      "Infrastructure and reliability",
      "Technical architecture decisions",
      "Code quality and engineering standards",
    ],
    children: [
      {
        id: "eng-be",
        name: "Backend",
        members: 12,
        about: "Server-side systems, APIs, and data storage.",
        founded: "2018",
        responsibilities: ["API development", "Database design", "Service reliability"],
        children: [
          { id: "eng-be-platform", name: "Platform", members: 5 },
          { id: "eng-be-billing", name: "Billing & Payments", members: 3 },
          { id: "eng-be-integrations", name: "Integrations", members: 4 },
        ],
      },
      {
        id: "eng-fe",
        name: "Frontend",
        members: 9,
        about: "Client-side applications and design system.",
        founded: "2019",
        responsibilities: ["Web application", "Design system", "Performance"],
        children: [
          { id: "eng-fe-webapp", name: "Web App", members: 5 },
          { id: "eng-fe-designsystem", name: "Design System", members: 2 },
          { id: "eng-fe-public", name: "Public Site", members: 2 },
        ],
      },
      {
        id: "eng-mobile",
        name: "Mobile",
        members: 5,
        about: "Native iOS and Android applications.",
        founded: "2020",
        children: [
          { id: "eng-ios", name: "iOS", members: 2 },
          { id: "eng-android", name: "Android", members: 3 },
        ],
      },
      { id: "eng-devops", name: "DevOps / SRE", members: 6 },
      { id: "eng-qa", name: "QA / Testing", members: 4 },
      {
        id: "eng-data",
        name: "Data / Analytics",
        members: 6,
        children: [
          { id: "eng-data-eng", name: "Data Engineering", members: 3 },
          { id: "eng-data-analysts", name: "Product Analytics", members: 3 },
        ],
      },
    ],
  },
  {
    id: "product",
    name: "Product Management",
    members: 8,
    about: "Defines product strategy, roadmap, and prioritisation.",
    founded: "2019",
    responsibilities: [
      "Product roadmap and strategy",
      "Cross-functional alignment",
      "User research and prioritisation",
    ],
    children: [
      { id: "product-core", name: "Core Product", members: 3 },
      { id: "product-growth", name: "Growth", members: 2 },
      { id: "product-platform", name: "Platform & Internal Tools", members: 3 },
    ],
  },
  {
    id: "design",
    name: "Design",
    members: 6,
    about: "User experience, brand identity, and visual design.",
    founded: "2019",
    responsibilities: [
      "UX research and design",
      "Design system ownership",
      "Brand and marketing design",
    ],
    children: [
      { id: "design-ux", name: "UX/UI", members: 4 },
      { id: "design-research", name: "Research", members: 1 },
      { id: "design-brand", name: "Brand / Marketing Design", members: 1 },
    ],
  },
  {
    id: "cs",
    name: "Customer Success",
    members: 10,
    about: "Ensures customers achieve their goals with the product.",
    founded: "2019",
    responsibilities: [
      "Customer onboarding",
      "Support (L1/L2)",
      "Account management and retention",
    ],
    children: [
      { id: "cs-onboarding", name: "Onboarding", members: 3 },
      { id: "cs-support", name: "Support (L1/L2)", members: 4 },
      { id: "cs-account", name: "Account Management", members: 3 },
    ],
  },
  {
    id: "sales",
    name: "Sales",
    members: 7,
    about: "Drives new revenue through inbound and outbound motions.",
    founded: "2020",
    children: [
      { id: "sales-inbound", name: "Inbound", members: 3 },
      { id: "sales-outbound", name: "Outbound", members: 3 },
      { id: "sales-ops", name: "Sales Ops", members: 1 },
    ],
  },
  {
    id: "marketing",
    name: "Marketing",
    members: 5,
    about: "Grows awareness, pipeline, and community.",
    founded: "2020",
    children: [
      { id: "mkt-content", name: "Content / SEO", members: 2 },
      { id: "mkt-performance", name: "Performance", members: 2 },
      { id: "mkt-events", name: "Events / Community", members: 1 },
    ],
  },
  {
    id: "people",
    name: "People & Operations",
    members: 4,
    about: "Talent, culture, and organisational operations.",
    founded: "2019",
    children: [
      { id: "people-hr", name: "HR / Talent", members: 2 },
      { id: "people-office", name: "Office / Ops", members: 2 },
    ],
  },
  {
    id: "finance",
    name: "Finance",
    members: 3,
    about: "Financial planning, accounting, and legal compliance.",
    founded: "2021",
    children: [
      { id: "fin-accounting", name: "Accounting", members: 1 },
      { id: "fin-controlling", name: "FP&A / Controlling", members: 1 },
      { id: "fin-legal", name: "Legal", members: 1 },
    ],
  },
  {
    id: "itsec",
    name: "IT & Security",
    members: 3,
    about: "Internal IT support, security posture, and compliance.",
    founded: "2021",
    children: [
      { id: "it-support", name: "Internal IT Support", members: 2 },
      { id: "it-security", name: "Security / Compliance", members: 1 },
    ],
  },
];

const DEFAULT_EXPANDED_IDS = ["eng", "product", "design"];

function findNodeById(
  nodes: DepartmentNode[],
  id: string,
): DepartmentNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

export default function DepartmentsContainer() {
  const [selectedId, setSelectedId] = useState<string>(
    initialData[0]?.id ?? "",
  );

  const selectedDepartment = findNodeById(initialData, selectedId);

  return (
    <div className="flex gap-4 overflow-hidden h-[calc(68dvh)]">

      <div className="w-72 flex-none border border-brown-200 rounded-xl bg-white overflow-hidden flex flex-col min-h-0">
        <DepartmentTree
          data={initialData}
          selectedId={selectedId}
          defaultExpandedIds={DEFAULT_EXPANDED_IDS}
          onSelect={setSelectedId}
        />
      </div>

      <div className="flex-1 border border-brown-200 rounded-xl bg-white overflow-hidden flex flex-col min-h-0">
        {selectedDepartment ? (
          <DepartmentDetailsPanel department={selectedDepartment}/>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-brown-400">
            Select a department to view details.
          </div>
        )}
      </div>
    </div>
  );
}
