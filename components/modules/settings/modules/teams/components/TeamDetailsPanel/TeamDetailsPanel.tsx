"use client";

import React, { useState } from "react";
import { Crosshair, Info, MoreHorizontal, Users } from "lucide-react";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/public/desact/src/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/public/desact/src/components/ui/dropdown-menu";
import type { TeamTreeNode } from "@/models/teams";
import { TeamPeopleTab } from "@/components/modules/settings/modules/teams/components/TeamPeopleTab/TeamPeopleTab";
import UserChip from "@/components/modules/settings/shared/UserChip/UserChip";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { ExportOrgTreeModal } from "@/components/modules/settings/shared/ExportOrgTreeModal";

type Props = {
  team: TeamTreeNode;
  parentName: string | null;
  onEdit: () => void;
  onAddChild: () => void;
  onArchive: () => void;
  onActivate: () => void;
  onDelete: () => void;
  onRecenter: () => void;
};

function TeamIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 16 16" fill="none" className="text-brown-600">
      <path d="M1.5 4.5A1 1 0 0 1 2.5 3.5h3.086l1 1H13.5a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V4.5z" fill="currentColor" fillOpacity="0.2" />
      <path d="M1.5 4.5A1 1 0 0 1 2.5 3.5h3.086l1 1H13.5a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V4.5z" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function LeadSection({ team }: { team: TeamTreeNode }) {
  const lead = team.lead;

  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brown-400">Team Lead</h3>

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

export function TeamDetailsPanel({
  team,
  parentName,
  onEdit,
  onAddChild,
  onArchive,
  onActivate,
  onDelete,
  onRecenter,
}: Props) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const isArchived = team.status === "ARCHIVED";

  return (
    <div className="flex h-full min-h-0 flex-col gap-5 p-6">
      {/* Header */}
      <div className="flex flex-none items-start gap-4">
        <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-brown-100">
          <TeamIcon />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-lg font-semibold text-brown-900">{team.name}</h2>
            {isArchived && (
              <span className="rounded bg-brown-100 px-1.5 py-0.5 text-xs font-medium text-brown-500">
                Archived
              </span>
            )}
          </div>
          {team.code && (
            <span className="mt-1 inline-block rounded border border-brown-200 bg-brown-50 px-1.5 py-0.5 font-mono text-xs text-brown-500">
              {team.code}
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-md text-brown-400 hover:bg-brown-100 hover:text-brown-700"
                aria-label="Team actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setIsExportOpen(true)}>Export…</DropdownMenuItem>
              <PermissionGate resource="ORG.TEAM" action="EDIT">
                {!isArchived && <DropdownMenuItem onSelect={onEdit}>Edit</DropdownMenuItem>}
                {!isArchived && (
                  <DropdownMenuItem onSelect={onAddChild}>Add sub-team</DropdownMenuItem>
                )}
                {isArchived ? (
                  <DropdownMenuItem onSelect={onActivate}>Activate</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onSelect={onArchive}>Archive</DropdownMenuItem>
                )}
              </PermissionGate>
              <PermissionGate resource="ORG.TEAM" action="MANAGE">
                <DropdownMenuItem onSelect={onDelete} className="text-red-600 focus:text-red-600">
                  Delete
                </DropdownMenuItem>
              </PermissionGate>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ExportOrgTreeModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        noun="team"
        nodeName={team.name}
        exportUrl={`/api/teams/${team.id}/export`}
        directSubNodes={team.directSubNodes}
        memberCount={team.memberCount}
        totalPeople={team.totalPeople}
      />

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
            {team.description ? (
              <p className="text-sm leading-relaxed text-brown-700">{team.description}</p>
            ) : (
              <p className="text-sm text-brown-400">No description.</p>
            )}
          </div>

          {/* Lead */}
          <LeadSection team={team} />

          {/* Parent team */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brown-400">Parent team</h3>
            <p className="text-sm text-brown-700">{parentName ?? "None (top-level)"}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-brown-200 p-3.5">
              <p className="mb-1 text-xs text-brown-500">Direct people</p>
              <p className="text-2xl font-semibold leading-none text-brown-900">{team.memberCount}</p>
            </div>
            <div className="rounded-lg border border-brown-200 p-3.5">
              <p className="mb-1 text-xs text-brown-500">Direct sub-teams</p>
              <p className="text-2xl font-semibold leading-none text-brown-900">{team.directSubNodes}</p>
            </div>
            <div className="rounded-lg border border-brown-200 p-3.5">
              <p className="mb-1 text-xs text-brown-500">Total people</p>
              <p className="text-2xl font-semibold leading-none text-brown-900">{team.totalPeople}</p>
              <p className="mt-1 text-[10px] leading-none text-brown-400">incl. all sub-teams</p>
            </div>
            <div className="rounded-lg border border-brown-200 p-3.5">
              <p className="mb-1 text-xs text-brown-500">Total sub-teams</p>
              <p className="text-2xl font-semibold leading-none text-brown-900">{team.totalSubNodes}</p>
              <p className="mt-1 text-[10px] leading-none text-brown-400">all levels below</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="people" className="mt-5 flex min-h-0 flex-1 flex-col">
          <TeamPeopleTab teamId={team.id} teamName={team.name} isArchived={isArchived} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
