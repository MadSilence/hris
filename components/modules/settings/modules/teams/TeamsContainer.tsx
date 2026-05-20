"use client";

import React, { useState } from "react";
import type { TeamNode } from "./components/TeamTree/TeamTree";
import { TeamTree } from "./components/TeamTree/TeamTree";
import { TeamDetailsPanel } from "./components/TeamDetailsPanel/TeamDetailsPanel";

const initialData: TeamNode[] = [
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
        id: "eng-backend",
        name: "Backend",
        members: 12,
        about: "Server-side systems, APIs, and data storage.",
        founded: "2018",
        responsibilities: ["API development", "Database design", "Service reliability"],
        children: [
          { id: "eng-backend-platform", name: "Platform", members: 5 },
          { id: "eng-backend-billing", name: "Billing & Payments", members: 3 },
          { id: "eng-backend-integrations", name: "Integrations", members: 4 },
        ],
      },
      {
        id: "eng-frontend",
        name: "Frontend",
        members: 9,
        about: "Client-side applications and design system.",
        founded: "2019",
        responsibilities: ["Web application", "Design system", "Performance"],
        children: [
          { id: "eng-frontend-webapp", name: "Web App", members: 5 },
          { id: "eng-frontend-designsystem", name: "Design System", members: 2 },
          { id: "eng-frontend-public", name: "Public Site", members: 2 },
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
    name: "Product",
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
];

const DEFAULT_EXPANDED_IDS = ["eng", "product", "design"];

function findNodeById(nodes: TeamNode[], id: string): TeamNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

export default function TeamsContainer() {
  const [selectedId, setSelectedId] = useState<string>(
    initialData[0]?.id ?? "",
  );

  const selectedTeam = findNodeById(initialData, selectedId);

  return (
    <div className="flex gap-4 overflow-hidden h-[calc(68dvh)]">
      <div className="w-72 flex-none border border-brown-200 rounded-xl bg-white overflow-hidden flex flex-col min-h-0">
        <TeamTree
          data={initialData}
          selectedId={selectedId}
          defaultExpandedIds={DEFAULT_EXPANDED_IDS}
          onSelect={setSelectedId}
        />
      </div>

      <div className="flex-1 border border-brown-200 rounded-xl bg-white overflow-hidden flex flex-col min-h-0">
        {selectedTeam ? (
          <TeamDetailsPanel team={selectedTeam} />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-brown-400">
            Select a team to view details.
          </div>
        )}
      </div>
    </div>
  );
}
