"use client";

import React, { useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/public/desact/src/components/ui/tabs";
import type { DepartmentNode } from "../DepartmentTree/DepartmentTree";

type Props = {
  department: DepartmentNode;
};

function DepartmentIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 16 16" fill="none" className="text-brown-600">
      <path
        d="M1.5 4.5A1 1 0 0 1 2.5 3.5h3.086l1 1H13.5a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V4.5z"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path
        d="M1.5 4.5A1 1 0 0 1 2.5 3.5h3.086l1 1H13.5a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V4.5z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

export function DepartmentDetailsPanel({ department }: Props) {
  const [activeTab, setActiveTab] = useState("overview");

  const directReports =
    department.directReports ?? department.children?.length ?? 0;

  return (
    <div className="flex flex-col h-full min-h-0 p-6 gap-5">
      {/* Header */}
      <div className="flex items-center gap-4 flex-none">
        <div className="w-11 h-11 rounded-xl bg-brown-100 flex items-center justify-center flex-none">
          <DepartmentIcon />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-brown-900 truncate">
            {department.name}
          </h2>
          {department.about && (
            <p className="text-sm text-brown-500 truncate">{department.about}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col min-h-0 gap-0"
      >
        <TabsList className="flex-none w-full justify-start bg-transparent border-b border-brown-200 rounded-none h-auto pb-0 px-0 gap-0">
          <TabsTrigger
            value="overview"
            className="rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-brown-800 data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-2 px-3 text-sm text-brown-500 data-[state=active]:text-brown-900 font-medium"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="people"
            className="rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-brown-800 data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-2 px-3 text-sm text-brown-500 data-[state=active]:text-brown-900 font-medium"
          >
            People
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="overview"
          className="flex-1 overflow-y-auto mt-5 min-h-0 space-y-5"
        >
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="border border-brown-200 rounded-lg p-3.5">
              <p className="text-xs text-brown-500 mb-1">Members</p>
              <p className="text-2xl font-semibold text-brown-900 leading-none">
                {department.members}
              </p>
            </div>
            <div className="border border-brown-200 rounded-lg p-3.5">
              <p className="text-xs text-brown-500 mb-1">Direct reports</p>
              <p className="text-2xl font-semibold text-brown-900 leading-none">
                {directReports}
              </p>
            </div>
            <div className="border border-brown-200 rounded-lg p-3.5">
              <p className="text-xs text-brown-500 mb-1">Founded</p>
              <p className="text-2xl font-semibold text-brown-900 leading-none">
                {department.founded ?? "—"}
              </p>
            </div>
          </div>

          {/* Description */}
          {department.about && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-brown-400 mb-2">
                Description
              </h3>
              <p className="text-sm text-brown-700 leading-relaxed">
                {department.about}
              </p>
            </div>
          )}

          {/* Responsibilities */}
          {(department.responsibilities?.length ?? 0) > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-brown-400 mb-2">
                Responsibilities
              </h3>
              <ul className="space-y-1.5">
                {department.responsibilities!.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-brown-700">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brown-300 flex-none" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="people"
          className="flex-1 overflow-y-auto mt-5 min-h-0"
        >
          <div className="flex items-center justify-center h-32 text-sm text-brown-400">
            People list coming soon.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
