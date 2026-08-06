"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useCompanyData } from "@/components/providers/CompanyDataProvider/CompanyDataProvider";
import { useTeamTree } from "@/components/modules/settings/modules/teams/hooks/useTeamTree/useTeamTree";
import { useActivateTeam } from "@/components/modules/settings/modules/teams/hooks/useActivateTeam/useActivateTeam";
import { TeamCanvas } from "@/components/modules/settings/modules/teams/components/TeamCanvas";
import { COMPANY_NODE_ID } from "@/components/modules/settings/modules/teams/components/TeamCanvas/CompanyNode";
import { TeamDetailsPanel } from "@/components/modules/settings/modules/teams/components/TeamDetailsPanel/TeamDetailsPanel";
import { CompanyDetailsPanel } from "@/components/modules/settings/modules/teams/components/CompanyDetailsPanel/CompanyDetailsPanel";
import { CreateTeamModal } from "@/components/modules/settings/modules/teams/components/modals/CreateTeamModal/CreateTeamModal";
import { EditTeamModal } from "@/components/modules/settings/modules/teams/components/modals/EditTeamModal/EditTeamModal";
import { DeleteTeamModal } from "@/components/modules/settings/modules/teams/components/modals/DeleteTeamModal/DeleteTeamModal";
import { ArchiveTeamModal } from "@/components/modules/settings/modules/teams/components/modals/ArchiveTeamModal/ArchiveTeamModal";
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

function collectParentIds(nodes: TeamTreeNode[]): Set<string> {
  const ids = new Set<string>();
  function traverse(node: TeamTreeNode) {
    if (node.children?.length) {
      ids.add(node.id);
      node.children.forEach(traverse);
    }
  }
  nodes.forEach(traverse);
  return ids;
}

export default function TeamsContainer() {
  const { company } = useCompanyData();

  const [includeArchived, setIncludeArchived] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(COMPANY_NODE_ID);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [recenterNonce, setRecenterNonce] = useState(0);

  const [createParentId, setCreateParentId] = useState<string | null | undefined>(undefined);
  const [editTarget, setEditTarget] = useState<TeamTreeNode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeamTreeNode | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<TeamTreeNode | null>(null);

  const { data: tree = [], isLoading, error } = useTeamTree(includeArchived);
  const activateTeam = useActivateTeam();

  const allFlat = flattenTree(tree);
  const totalMembers = allFlat.reduce((sum, node) => sum + node.memberCount, 0);
  const selectedTeam = selectedId === COMPANY_NODE_ID ? null : findById(tree, selectedId);
  const selectedParentName = selectedTeam?.parentId
    ? findById(tree, selectedTeam.parentId)?.name ?? null
    : null;
  const isCreateOpen = createParentId !== undefined;

  const didInitCollapse = useRef(false);
  useEffect(() => {
    if (didInitCollapse.current || isLoading) return;
    didInitCollapse.current = true;
    setCollapsed(collectParentIds(tree));
  }, [isLoading, tree]);

  const toggleCollapse = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const companyName = company?.name ?? "Company";
  const companyLogo = company?.companyLogo ?? null;

  return (
    <>
      {/* Canvas + docked panel (flush, one unified surface) */}
      <div className="flex h-[76dvh] overflow-hidden rounded-xl border border-brown-200">
        <div className="relative min-w-0 flex-1 bg-brown-50/40">
          {isLoading ? (
            <CanvasLoading label="Loading teams…" />
          ) : error ? (
            <CanvasMessage tone="error">Failed to load teams.</CanvasMessage>
          ) : tree.length === 0 ? (
            <CanvasMessage>
              <span>No teams yet.</span>
              <PermissionGate resource="ORG.TEAM" action="EDIT">
                <Button size="sm" onClick={() => setCreateParentId(null)} className="mt-3 gap-1.5">
                  <Plus className="h-4 w-4" />
                  Create your first team
                </Button>
              </PermissionGate>
            </CanvasMessage>
          ) : (
            <>
              <TeamCanvas
                tree={tree}
                company={{ name: companyName, logo: companyLogo, memberCount: totalMembers }}
                collapsed={collapsed}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onToggleCollapse={toggleCollapse}
                recenterSignal={recenterNonce}
              />

              <label className="absolute bottom-4 left-20 z-10 flex cursor-pointer select-none items-center gap-2 rounded-lg border border-brown-200 bg-white px-3 py-1.5 text-sm text-brown-700 shadow-sm">
                <Checkbox
                  checked={includeArchived}
                  onCheckedChange={(v) => setIncludeArchived(v === true)}
                />
                Show archived
              </label>
            </>
          )}
        </div>

        <div className="w-[380px] flex-none overflow-hidden border-l border-brown-200 bg-white">
          {selectedTeam ? (
            <TeamDetailsPanel
              team={selectedTeam}
              parentName={selectedParentName}
              onEdit={() => setEditTarget(selectedTeam)}
              onAddChild={() => setCreateParentId(selectedTeam.id)}
              onArchive={() => setArchiveTarget(selectedTeam)}
              onActivate={() => activateTeam.mutate(selectedTeam.id)}
              onDelete={() => setDeleteTarget(selectedTeam)}
              onRecenter={() => setRecenterNonce((n) => n + 1)}
            />
          ) : (
            <CompanyDetailsPanel
              name={companyName}
              logo={companyLogo}
              topLevelCount={tree.length}
              totalCount={allFlat.length}
            />
          )}
        </div>
      </div>

      {isCreateOpen && (
        <CreateTeamModal
          open
          onClose={() => setCreateParentId(undefined)}
          parentOptions={allFlat}
          defaultParentId={createParentId}
        />
      )}

      {editTarget && (
        <EditTeamModal
          open
          onClose={() => setEditTarget(null)}
          team={editTarget}
          parentOptions={allFlat}
        />
      )}

      {deleteTarget && (
        <DeleteTeamModal
          open
          onClose={() => setDeleteTarget(null)}
          team={deleteTarget}
          allTeams={allFlat}
          onDeleted={() => {
            if (selectedId === deleteTarget.id) setSelectedId(COMPANY_NODE_ID);
          }}
        />
      )}

      {archiveTarget && (
        <ArchiveTeamModal
          open
          onClose={() => setArchiveTarget(null)}
          team={archiveTarget}
          allTeams={allFlat}
          onArchived={() => {
            if (selectedId === archiveTarget.id) setSelectedId(COMPANY_NODE_ID);
          }}
        />
      )}
    </>
  );
}

function CanvasLoading({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="flex h-full flex-col items-center justify-center px-6"
    >
      <div className="flex flex-col items-center animate-pulse">
        <div className="flex w-56 items-center gap-3 rounded-xl border border-brown-200 bg-white p-3 shadow-sm">
          <div className="h-9 w-9 flex-none rounded-lg bg-brown-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-28 rounded bg-brown-100" />
            <div className="h-2.5 w-16 rounded bg-brown-100" />
          </div>
        </div>
        <div className="h-6 w-px bg-brown-200" />
        <div className="h-px w-64 bg-brown-200" />
        <div className="flex gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="h-6 w-px bg-brown-200" />
              <div className="w-40 space-y-2 rounded-xl border border-brown-200 bg-white p-3 shadow-sm">
                <div className="h-3 w-24 rounded bg-brown-100" />
                <div className="h-2.5 w-14 rounded bg-brown-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-6 text-sm text-brown-400">{label}</p>
    </div>
  );
}

function CanvasMessage({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "error";
}) {
  return (
    <div
      className={`flex h-full flex-col items-center justify-center px-6 text-center text-sm ${
        tone === "error" ? "text-red-500" : "text-brown-400"
      }`}
    >
      {children}
    </div>
  );
}
