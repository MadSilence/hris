"use client";
import React from "react";
import { TreeGrid, TreeGridColumn, TreeNodeBase } from "@/components/ui/TreeGrid";
import Admin from "@/public/icons/admin.svg";
import Search from "@/public/icons/search.svg";
import Home from "@/public/icons/home.svg";

type DepartmentNode = TreeNodeBase & {
  members: number;
  about?: string | null;
  code?: string | null;
};

const initialData: DepartmentNode[] = [
  {
    id: "eng",
    name: "Engineering",
    members: 42,
    children: [
      {
        id: "eng-be",
        name: "Backend",
        members: 12,
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
        children: [
          { id: "eng-ios", name: "iOS", members: 2 },
          { id: "eng-android", name: "Android", members: 3 },
        ],
      },
      {
        id: "eng-devops",
        name: "DevOps / SRE",
        members: 6,
      },
      {
        id: "eng-qa",
        name: "QA / Testing",
        members: 4,
      },
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
    children: [
      { id: "people-hr", name: "HR / Talent", members: 2 },
      { id: "people-office", name: "Office / Ops", members: 2 },
    ],
  },
  {
    id: "finance",
    name: "Finance",
    members: 3,
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
    children: [
      { id: "it-support", name: "Internal IT Support", members: 2 },
      { id: "it-security", name: "Security / Compliance", members: 1 },
    ],
  },
];

const columns: TreeGridColumn<DepartmentNode>[] = [
  {
    id: "members",
    header: "Members",
    span: 1,
    align: "center",
    headerIcon: <Admin/>,
    render: (n) => n.members ?? 0,
  },
  {
    id: "about",
    header: "About",
    span: 1,
    headerIcon: <Home/>,
    render: (n) => n.about ?? "-",
  },
  {
    id: "code",
    header: "Code",
    span: 1,
    align: "end",
    headerIcon: <Search/>,
    render: (n) => n.code ?? "-",
  },
];

export default function DepartmentsPage() {
  const [data, setData] = React.useState<DepartmentNode[]>(initialData);

  return (
    <TreeGrid<DepartmentNode>
      data={data}
      enableDragAndDrop
      columns={columns}
      nameSpan={3}
      defaultExpandedIds={["cs", "finance"]}
      onPositionsChange={(positions) => {
        console.log(positions);
      }}
      onDataChange={(next) => {
        setData(next);
      }}
    />
  );
}
