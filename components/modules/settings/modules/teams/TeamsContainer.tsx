"use client";

import React, { useState } from "react";
import { useTeamTree } from "@/components/modules/settings/modules/teams/hooks/useTeamTree/useTeamTree";
import { useArchiveTeam } from "@/components/modules/settings/modules/teams/hooks/useArchiveTeam/useArchiveTeam";
import { useActivateTeam } from "@/components/modules/settings/modules/teams/hooks/useActivateTeam/useActivateTeam";
import { TeamTree } from "@/components/modules/settings/modules/teams/components/TeamTree/TeamTree";
import { TeamDetailsPanel } from "@/components/modules/settings/modules/teams/components/TeamDetailsPanel/TeamDetailsPanel";
import { TeamTreeSkeleton } from "@/components/modules/settings/modules/teams/components/TeamTreeSkeleton/TeamTreeSkeleton";
import { CreateTeamModal } from "@/components/modules/settings/modules/teams/components/modals/CreateTeamModal/CreateTeamModal";
import { EditTeamModal } from "@/components/modules/settings/modules/teams/components/modals/EditTeamModal/EditTeamModal";
import { DeleteTeamModal } from "@/components/modules/settings/modules/teams/components/modals/DeleteTeamModal/DeleteTeamModal";
import { AssignTeamMemberModal } from "@/components/modules/settings/modules/teams/components/modals/AssignTeamMemberModal/AssignTeamMemberModal";
import { SetTeamLeadModal } from "@/components/modules/settings/modules/teams/components/modals/SetTeamLeadModal/SetTeamLeadModal";
import type { TeamTreeNode } from "@/models/teams";

function flattenTree(nodes: TeamTreeNode[]): TeamTreeNode[] {
  const result: TeamTreeNode[] = [];
  function traverse(node: TeamTreeNode) {
    result.push(node);
    node.children?.forEach(traverse);
  }
  nodes.forEach(traverse);
  return result;
}

function findById(nodes: TeamTreeNode[], id: string): TeamTreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children?.length) {
      const found = findById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

export default function TeamsContainer() {
  const [includeArchived, setIncludeArchived] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<TeamTreeNode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeamTreeNode | null>(null);
  const [addMemberTarget, setAddMemberTarget] = useState<string | null>(null);
  const [setLeadTarget, setSetLeadTarget] = useState<TeamTreeNode | null>(null);

  const { data: tree = [], isLoading, error } = useTeamTree(includeArchived);
  const archiveTeam = useArchiveTeam();
  const activateTeam = useActivateTeam();

  const allFlat = flattenTree(tree);
  const selected = selectedId ? findById(tree, selectedId) : null;
  const effectiveSelected = selected ?? (tree[0] ?? null);

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-end">
          <label className="flex items-center gap-2 text-sm text-brown-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(e) => setIncludeArchived(e.target.checked)}
              className="rounded"
            />
            Show archived
          </label>
        </div>

        <div className="flex gap-4 overflow-hidden h-[calc(68dvh)]">
          <div className="w-72 flex-none border border-brown-200 rounded-xl bg-white overflow-hidden flex flex-col min-h-0">
            {isLoading ? (
              <TeamTreeSkeleton />
            ) : error ? (
              <div className="flex items-center justify-center h-20 text-sm text-red-500 px-4 text-center">
                Failed to load teams.
              </div>
            ) : (
              <TeamTree
                data={tree}
                selectedId={selectedId ?? (effectiveSelected?.id ?? null)}
                defaultExpandedIds={tree.slice(0, 3).map((n) => n.id)}
                onSelect={setSelectedId}
                onAdd={() => setShowCreate(true)}
                onEdit={(node) => setEditTarget(node)}
                onArchive={(node) => archiveTeam.mutate(node.id)}
                onActivate={(node) => activateTeam.mutate(node.id)}
                onDelete={(node) => setDeleteTarget(node)}
              />
            )}
          </div>

          <div className="flex-1 border border-brown-200 rounded-xl bg-white overflow-hidden flex flex-col min-h-0">
            {effectiveSelected ? (
              <TeamDetailsPanel
                team={effectiveSelected}
                onEdit={() => setEditTarget(effectiveSelected)}
                onAddMember={() => setAddMemberTarget(effectiveSelected.id)}
                onSetLead={() => setSetLeadTarget(effectiveSelected)}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-brown-400">
                {isLoading ? null : "No teams yet. Create your first team."}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreate && (
        <CreateTeamModal open onClose={() => setShowCreate(false)} parentOptions={allFlat} />
      )}

      {editTarget && (
        <EditTeamModal open onClose={() => setEditTarget(null)} team={editTarget} parentOptions={allFlat} />
      )}

      {deleteTarget && (
        <DeleteTeamModal
          open
          onClose={() => setDeleteTarget(null)}
          team={deleteTarget}
          allTeams={allFlat}
          onDeleted={() => { if (selectedId === deleteTarget.id) setSelectedId(null); }}
        />
      )}

      {addMemberTarget && (
        <AssignTeamMemberModal open onClose={() => setAddMemberTarget(null)} teamId={addMemberTarget} />
      )}

      {setLeadTarget && (
        <SetTeamLeadModal
          open
          onClose={() => setSetLeadTarget(null)}
          teamId={setLeadTarget.id}
          currentLeadId={setLeadTarget.leadId}
        />
      )}
    </>
  );
}
