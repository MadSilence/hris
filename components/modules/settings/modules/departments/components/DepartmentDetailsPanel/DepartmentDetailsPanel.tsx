"use client";

import React, { useEffect, useState } from "react";
import { Archive, ArchiveRestore, Crosshair, Info, Pencil, Trash2, Users } from "lucide-react";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/public/desact/src/components/ui/tabs";
import {
  RowAction,
  RowActionDestructive,
  RowActionsMenu,
} from "@/components/ui/RowActionsMenu";
import type { DepartmentTreeNode } from "@/models/departments";
import { DepartmentPeopleTab } from "@/components/modules/settings/modules/departments/components/DepartmentPeopleTab/DepartmentPeopleTab";
import UserChip from "@/components/modules/settings/shared/UserChip/UserChip";
import { PermissionGate } from "@/components/auth/PermissionGate";

type Props = {
  department: DepartmentTreeNode;
  parentName: string | null;
  /** Set when a people-search hit points into this department: opens the People tab on them. */
  peopleFocus?: { userId: string; name: string } | null;
  onEdit: () => void;
  onArchive: () => void;
  onActivate: () => void;
  onDelete: () => void;
  onRecenter: () => void;
};

function DepartmentIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 16 16" fill="none" className="text-brown-600">
      <path d="M1.5 4.5A1 1 0 0 1 2.5 3.5h3.086l1 1H13.5a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V4.5z" fill="currentColor" fillOpacity="0.2" />
      <path d="M1.5 4.5A1 1 0 0 1 2.5 3.5h3.086l1 1H13.5a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V4.5z" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function LeadSection({ department }: { department: DepartmentTreeNode }) {
  const lead = department.lead;

  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brown-400">Department Lead</h3>

      {lead ? (
        <UserChip
          id={lead.id}
          name={`${lead.firstName ?? ""} ${lead.lastName ?? ""}`.trim() || "Lead"}
          firstName={lead.firstName}
          lastName={lead.lastName}
          avatarUrl={lead.avatarUrl}
          className="hover:bg-brown-50 hover:shadow-none"
        />
      ) : (
        <p className="text-sm text-brown-400">No lead assigned.</p>
      )}
    </div>
  );
}

export function DepartmentDetailsPanel({
  department,
  parentName,
  peopleFocus,
  onEdit,
  onArchive,
  onActivate,
  onDelete,
  onRecenter,
}: Props) {
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (peopleFocus) setActiveTab("people");
  }, [peopleFocus]);
  const isArchived = department.status === "ARCHIVED";

  return (
    <div className="flex h-full min-h-0 flex-col gap-5 p-6">
      {/* Header */}
      <div className="flex flex-none items-start gap-4">
        <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-brown-100">
          <DepartmentIcon />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-lg font-semibold text-brown-900">{department.name}</h2>
            {isArchived && (
              <span className="rounded bg-brown-100 px-1.5 py-0.5 text-xs font-medium text-brown-500">
                Archived
              </span>
            )}
          </div>
          {department.code && (
            <span className="mt-1 inline-block rounded border border-brown-200 bg-brown-50 px-1.5 py-0.5 font-mono text-xs text-brown-500">
              {department.code}
            </span>
          )}
        </div>

        <div className="flex flex-none items-center gap-1">
          <button
            type="button"
            onClick={onRecenter}
            aria-label="Center on chart"
            title="Center on chart"
            className="flex h-8 w-8 items-center justify-center rounded-md text-brown-400 hover:bg-brown-100 hover:text-brown-700"
          >
            <Crosshair className="h-4 w-4" />
          </button>

          <RowActionsMenu label="Department Actions">
            <PermissionGate resource="ORG.DEPARTMENT" action="EDIT">
              {!isArchived && (
                <RowAction icon={<Pencil className="h-4 w-4" />} onClick={onEdit}>
                  Edit
                </RowAction>
              )}
              {isArchived ? (
                <RowAction icon={<ArchiveRestore className="h-4 w-4" />} onClick={onActivate}>
                  Unarchive
                </RowAction>
              ) : (
                <RowAction icon={<Archive className="h-4 w-4" />} onClick={onArchive}>
                  Archive
                </RowAction>
              )}
            </PermissionGate>
            <PermissionGate resource="ORG.DEPARTMENT" action="MANAGE">
              <RowActionDestructive icon={<Trash2 className="h-4 w-4" />} onClick={onDelete}>
                Delete
              </RowActionDestructive>
            </PermissionGate>
          </RowActionsMenu>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col">
        <TabsList className="grid w-full flex-none grid-cols-2 bg-brown-50">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="people" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            People
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5 -mx-1.5 min-h-0 flex-1 space-y-5 overflow-y-auto px-1.5">
          {/* Description */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brown-400">Description</h3>
            {department.description ? (
              <p className="text-sm leading-relaxed text-brown-700">{department.description}</p>
            ) : (
              <p className="text-sm text-brown-400">No description.</p>
            )}
          </div>

          {/* Lead */}
          <LeadSection department={department} />

          {/* Parent department */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brown-400">Parent department</h3>
            <p className="text-sm text-brown-700">{parentName ?? "None (top-level)"}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-brown-200 p-3.5">
              <p className="mb-1 text-xs text-brown-500">Direct people</p>
              <p className="text-2xl font-semibold leading-none text-brown-900">{department.memberCount}</p>
            </div>
            <div className="rounded-lg border border-brown-200 p-3.5">
              <p className="mb-1 text-xs text-brown-500">Direct sub-departments</p>
              <p className="text-2xl font-semibold leading-none text-brown-900">{department.directSubNodes}</p>
            </div>
            <div className="rounded-lg border border-brown-200 p-3.5">
              <p className="mb-1 text-xs text-brown-500">Total people</p>
              <p className="text-2xl font-semibold leading-none text-brown-900">{department.totalPeople}</p>
              <p className="mt-1 text-[10px] leading-none text-brown-400">incl. all sub-departments</p>
            </div>
            <div className="rounded-lg border border-brown-200 p-3.5">
              <p className="mb-1 text-xs text-brown-500">Total sub-departments</p>
              <p className="text-2xl font-semibold leading-none text-brown-900">{department.totalSubNodes}</p>
              <p className="mt-1 text-[10px] leading-none text-brown-400">all levels below</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="people" className="mt-5 flex min-h-0 flex-1 flex-col">
          <DepartmentPeopleTab
            departmentId={department.id}
            departmentName={department.name}
            isArchived={isArchived}
            hasChildren={(department.children?.length ?? 0) > 0}
            initialQuery={peopleFocus?.name}
            highlightUserId={peopleFocus?.userId ?? null}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
