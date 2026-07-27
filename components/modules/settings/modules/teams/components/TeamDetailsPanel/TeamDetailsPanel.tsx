"use client";

import React, { useState } from "react";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/public/desact/src/components/ui/tabs";
import { Button } from "@/public/desact/src/components/ui/button";
import type { TeamTreeNode } from "@/models/teams";
import { TeamMembersList } from "@/components/modules/settings/modules/teams/components/TeamMembersList/TeamMembersList";
import { PermissionGate } from "@/components/auth/PermissionGate";

type Props = {
  team: TeamTreeNode;
  onEdit: () => void;
  onAddMember: () => void;
  onSetLead: () => void;
};

function TeamIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 16 16" fill="none" className="text-brown-600">
      <path d="M1.5 4.5A1 1 0 0 1 2.5 3.5h3.086l1 1H13.5a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V4.5z" fill="currentColor" fillOpacity="0.2" />
      <path d="M1.5 4.5A1 1 0 0 1 2.5 3.5h3.086l1 1H13.5a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V4.5z" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function TeamDetailsPanel({ team, onEdit, onAddMember, onSetLead }: Props) {
  const [activeTab, setActiveTab] = useState("overview");
  const isArchived = team.status === "ARCHIVED";

  return (
    <div className="flex flex-col h-full min-h-0 p-6 gap-5">
      <div className="flex items-start gap-4 flex-none">
        <div className="w-11 h-11 rounded-xl bg-brown-100 flex items-center justify-center flex-none">
          <TeamIcon />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-semibold text-brown-900 truncate">{team.name}</h2>
            {isArchived && (
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-brown-100 text-brown-500">Archived</span>
            )}
            {team.code && (
              <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-brown-50 text-brown-500 border border-brown-200">{team.code}</span>
            )}
          </div>
          {team.description && (
            <p className="text-sm text-brown-500 truncate mt-0.5">{team.description}</p>
          )}
        </div>
        <PermissionGate resource="ORG.TEAM" action="EDIT">
          {!isArchived && (
            <Button variant="outline" size="sm" onClick={onEdit} className="flex-none">Edit</Button>
          )}
        </PermissionGate>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 gap-0">
        <TabsList
          variant="underline"
          className="flex-none w-full justify-start bg-transparent border-b border-brown-200 rounded-none h-auto pb-0 px-0 gap-0"
        >
          <TabsTrigger value="overview"
            className="rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-brown-800 data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-2 px-3 text-sm text-brown-500 data-[state=active]:text-brown-900 font-medium">
            Overview
          </TabsTrigger>
          <TabsTrigger value="people"
            className="rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-brown-800 data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-2 px-3 text-sm text-brown-500 data-[state=active]:text-brown-900 font-medium">
            People
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex-1 overflow-y-auto mt-5 min-h-0 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-brown-200 rounded-lg p-3.5">
              <p className="text-xs text-brown-500 mb-1">Members</p>
              <p className="text-2xl font-semibold text-brown-900 leading-none">{team.memberCount}</p>
            </div>
            <div className="border border-brown-200 rounded-lg p-3.5">
              <p className="text-xs text-brown-500 mb-1">Sub-teams</p>
              <p className="text-2xl font-semibold text-brown-900 leading-none">{team.children?.length ?? 0}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-brown-400">Lead</h3>
              <PermissionGate resource="ORG.TEAM" action="EDIT">
                {!isArchived && (
                  <button onClick={onSetLead} className="text-xs text-brown-500 hover:text-brown-800">
                    {team.leadId ? "Change" : "Set lead"}
                  </button>
                )}
              </PermissionGate>
            </div>
            {team.leadId ? (
              <p className="text-sm text-brown-700 font-mono">{team.leadId}</p>
            ) : (
              <p className="text-sm text-brown-400">No lead assigned.</p>
            )}
          </div>

          {team.description && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-brown-400 mb-2">Description</h3>
              <p className="text-sm text-brown-700 leading-relaxed">{team.description}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="people" className="flex-1 overflow-y-auto mt-5 min-h-0 flex flex-col gap-3">
          <PermissionGate resource="ORG.TEAM" action="EDIT">
            {!isArchived && (
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={onAddMember}>Add member</Button>
              </div>
            )}
          </PermissionGate>
          <TeamMembersList teamId={team.id} isArchived={isArchived} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
