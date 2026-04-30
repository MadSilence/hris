"use client";

import React from "react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { Building2, GitBranch } from "lucide-react";

import PeopleTableContainer from "@/components/modules/organization/components/PeopleTableContainer/PeopleTableContainer";
import { usePermissions } from "@/components/auth/PermissionsContext";
import { AccessDenied } from "@/components/auth/AccessDenied";

import { Button } from "@/public/desact/src/components/ui/button";
// import { Tabs, TabsList, TabsTrigger } from "@/public/desact/src/components/ui/tabs";

const tabs = [
  {
    id: "people",
    label: "Organisation Structure",
    href: "people",
    icon: Building2,
  },
  {
    id: "chart",
    label: "People Chart",
    href: "chart",
    icon: GitBranch,
  },
];

export default function OrganizationPeoplePage() {
  const { canModule, loading } = usePermissions();
  const segment = useSelectedLayoutSegment();

  const activeTab = segment ?? "people";

  if (loading) return null;
  if (!canModule("PEOPLE", "view")) return <AccessDenied/>;

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[40px] font-semibold">Organisation</h1>

          <p className="max-w-2xl text-sm text-[var(--color-text-tertiary)]">
            Browse employees, search by name/email, and manage custom attributes.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-8">

        {/* ===== ACTIVE VARIANT (Underline) ===== */}
        <nav className="flex gap-1 border-b border-brown-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <Button
                key={tab.id}
                asChild
                variant="ghost"
                className={`rounded-none hover:bg-brown-50 ${
                  isActive
                    ? "border-b-2 border-brown-700 text-brown-700"
                    : "text-brown-600 hover:text-brown-700"
                }`}
              >
                <Link href={tab.href} className="no-underline">
                  <Icon className="mr-2 h-4 w-4"/>
                  {tab.label}
                </Link>
              </Button>
            );
          })}
        </nav>

        {/* ===== VARIANT 1 (Desact Tabs) ===== */}
        {/*
        <Tabs value={activeTab} className="w-full">
          <TabsList className="grid w-full max-w-xl grid-cols-2 bg-brown-50">
            {tabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <TabsTrigger key={tab.id} value={tab.id} asChild>
                  <Link
                    href={tab.href}
                    className="no-underline flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </Link>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
        */}

        {/* ===== VARIANT 3 (Pills) ===== */}
        {/*
        <div className="inline-flex w-fit rounded-lg bg-brown-50 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`no-underline inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white text-brown-700 shadow-sm"
                    : "text-[var(--color-text-tertiary)] hover:text-brown-600"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </div>
        */}

        {/* ===== VARIANT 4 (Segmented) ===== */}
        {/*
        <div className="grid w-full max-w-2xl grid-cols-2 rounded-xl border bg-white p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`no-underline flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-brown-50 text-brown-700"
                    : "text-[var(--color-text-tertiary)] hover:bg-brown-50 hover:text-brown-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </div>
        */}

        {/* ===== VARIANT 5 (Cards) ===== */}
        {/*
        <div className="grid gap-3 md:grid-cols-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`no-underline rounded-xl border p-4 transition-all ${
                  isActive
                    ? "border-brown-400 bg-brown-50 text-brown-700"
                    : "bg-white text-[var(--color-text-primary)] hover:bg-brown-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                    <Icon className="h-5 w-5 text-brown-600" />
                  </div>

                  <div>
                    <div className="font-medium">{tab.label}</div>
                    <div className="text-sm text-[var(--color-text-tertiary)]">
                      {tab.id === "people"
                        ? "Browse employee structure"
                        : "View people hierarchy"}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        */}

      </section>

      <section>
        <PeopleTableContainer/>
      </section>
    </div>
  );
}
