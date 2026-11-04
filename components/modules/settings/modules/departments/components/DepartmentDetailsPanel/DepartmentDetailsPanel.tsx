"use client";

import React, { useEffect, useState } from "react";
import { Archive02Icon, ArchiveArrowUpIcon, Delete02Icon, InformationCircleIcon, PencilEdit02Icon, Target02Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/desact/tabs";
import {
  RowAction,
  RowActionDestructive,
  RowActionsMenu,
} from "@/components/ui/RowActionsMenu";
import type { DepartmentTreeNode } from "@/models/departments";
import { DepartmentPeopleTab } from "@/components/modules/settings/modules/departments/components/DepartmentPeopleTab/DepartmentPeopleTab";
import UserChip from "@/components/modules/settings/shared/UserChip/UserChip";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { StatusBadge } from "@/components/ui/StatusBadge";

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
    <svg width="26" height="26" viewBox="0 0 16 16" fill="none" className="text-secondary">
      <path d="M1.5 4.5A1 1 0 0 1 2.5 3.5h3.086l1 1H13.5a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V4.5z" fill="currentColor" fillOpacity="0.2" />
      <path d="M1.5 4.5A1 1 0 0 1 2.5 3.5h3.086l1 1H13.5a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V4.5z" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function LeadSection({ department }: { department: DepartmentTreeNode }) {
  const lead = department.lead;

  return (
    <div>
      <h3 className="mb-2 text-hint font-semibold text-tertiary">Department lead</h3>

      {lead ? (
        <UserChip
          id={lead.id}
          name={`${lead.firstName ?? ""} ${lead.lastName ?? ""}`.trim() || "Lead"}
          firstName={lead.firstName}
          lastName={lead.lastName}
          avatarUrl={lead.avatarUrl}
          className="hover:bg-subtle hover:shadow-none"
        />
      ) : (
        <p className="text-body text-tertiary">No lead assigned.</p>
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
        <div className="flex h-12 w-12 flex-none items-center justify-center rounded-popover bg-mist">
          <DepartmentIcon />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-section-title text-primary">{department.name}</h2>
            {isArchived && (
              <StatusBadge status="archived" className="px-1.5 py-0.5 text-hint" />
            )}
          </div>
          {department.code && (
            <span className="mt-1 inline-block rounded-tag border border-divider bg-subtle px-1.5 py-0.5 font-mono text-hint text-tertiary">
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
            className="flex h-8 w-8 items-center justify-center rounded-control text-tertiary hover:bg-mist hover:text-secondary"
          >
            <Icon icon={Target02Icon} size="sm" />
          </button>

          <RowActionsMenu label="Department actions">
            <PermissionGate resource="ORG.DEPARTMENT" action="EDIT">
              {!isArchived && (
                <RowAction icon={<Icon icon={PencilEdit02Icon} size="sm" />} onClick={onEdit}>
                  Edit
                </RowAction>
              )}
              {isArchived ? (
                <RowAction icon={<Icon icon={ArchiveArrowUpIcon} size="sm" />} onClick={onActivate}>
                  Unarchive
                </RowAction>
              ) : (
                <RowAction icon={<Icon icon={Archive02Icon} size="sm" />} onClick={onArchive}>
                  Archive
                </RowAction>
              )}
            </PermissionGate>
            <PermissionGate resource="ORG.DEPARTMENT" action="MANAGE">
              <RowActionDestructive icon={<Icon icon={Delete02Icon} size="sm" />} onClick={onDelete}>
                Delete
              </RowActionDestructive>
            </PermissionGate>
          </RowActionsMenu>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col">
        <TabsList className="flex-none">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Icon icon={InformationCircleIcon} size="sm" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="people" className="flex items-center gap-2">
            <Icon icon={UserGroupIcon} size="sm" />
            People
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5 -mx-1.5 min-h-0 flex-1 space-y-5 overflow-y-auto px-1.5">
          {/* Description */}
          <div>
            <h3 className="mb-2 text-hint font-semibold text-tertiary">Description</h3>
            {department.description ? (
              <p className="text-body leading-relaxed text-secondary">{department.description}</p>
            ) : (
              <p className="text-body text-tertiary">No description.</p>
            )}
          </div>

          {/* Lead */}
          <LeadSection department={department} />

          {/* Parent department */}
          <div>
            <h3 className="mb-2 text-hint font-semibold text-tertiary">Parent department</h3>
            <p className="text-body text-secondary">{parentName ?? "None (top-level)"}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-control border border-divider p-3.5">
              <p className="mb-1 text-hint text-tertiary">Direct people</p>
              <p className="text-page-title leading-none text-primary">{department.memberCount}</p>
            </div>
            <div className="rounded-control border border-divider p-3.5">
              <p className="mb-1 text-hint text-tertiary">Direct sub-departments</p>
              <p className="text-page-title leading-none text-primary">{department.directSubNodes}</p>
            </div>
            <div className="rounded-control border border-divider p-3.5">
              <p className="mb-1 text-hint text-tertiary">Total people</p>
              <p className="text-page-title leading-none text-primary">{department.totalPeople}</p>
              <p className="mt-1 text-hint leading-none text-tertiary">incl. all sub-departments</p>
            </div>
            <div className="rounded-control border border-divider p-3.5">
              <p className="mb-1 text-hint text-tertiary">Total sub-departments</p>
              <p className="text-page-title leading-none text-primary">{department.totalSubNodes}</p>
              <p className="mt-1 text-hint leading-none text-tertiary">all levels below</p>
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
