"use client";

import React, { useCallback, useMemo, useState } from "react";
import { PanelRightOpen } from "lucide-react";

import { useOrgChart } from "@/components/modules/organization/orgChart/hooks/useOrgChart/useOrgChart";
import { useSetManager } from "@/components/modules/organization/orgChart/hooks/useSetManager";
import { buildOrgForest, type OrgTreeNode } from "@/components/modules/organization/orgChart/utils/buildOrgTree";
import { OrgChartCanvas } from "@/components/modules/organization/orgChart/components/OrgChartCanvas";
import { UserDetailPanel } from "@/components/modules/organization/orgChart/components/UserDetailPanel/UserDetailPanel";
import { useAccess } from "@/components/auth/useAccess";
import { canAccess } from "@/models/access";

export default function OrgChartContainer() {
  const { data: users = [], isLoading, error } = useOrgChart();
  const setManager = useSetManager();
  const { access } = useAccess();
  const canReparent = canAccess({ access, resource: "PEOPLE.PROFILE", action: "EDIT" });

  const forest = useMemo(() => buildOrgForest(users), [users]);

  const descendants = useMemo(() => {
    const map = new Map<string, Set<string>>();
    const collect = (node: OrgTreeNode): Set<string> => {
      const set = new Set<string>();
      for (const child of node.children) {
        set.add(child.user.id);
        for (const d of collect(child)) set.add(d);
      }
      map.set(node.user.id, set);
      return set;
    };
    forest.roots.forEach(collect);
    return map;
  }, [forest]);

  const canDrop = useCallback(
    (userId: string, targetId: string) => {
      if (userId === targetId) return false;
      if (descendants.get(userId)?.has(targetId)) return false;
      const currentManagerId = forest.byId.get(userId)?.managerId ?? null;
      return currentManagerId !== targetId;
    },
    [descendants, forest],
  );

  const handleReparent = useCallback(
    (userId: string, targetId: string) => {
      if (!canDrop(userId, targetId)) return;
      setManager.mutate({ userId, managerId: targetId });
    },
    [canDrop, setManager],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [panelOpen, setPanelOpen] = useState(true);
  const [recenterNonce, setRecenterNonce] = useState(0);

  const toggleCollapse = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleCanvasSelect = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id) setPanelOpen(true);
  }, []);

  const handlePanelSelect = useCallback((id: string) => {
    setSelectedId(id);
    setPanelOpen(true);
    setRecenterNonce((n) => n + 1);
  }, []);

  const selectedUser = selectedId ? forest.byId.get(selectedId) ?? null : null;
  const manager =
    selectedUser?.managerId ? forest.byId.get(selectedUser.managerId) ?? null : null;
  const reports = selectedUser ? forest.reportsById.get(selectedUser.id) ?? [] : [];

  return (
    <div className="flex h-[76dvh] overflow-hidden rounded-xl border border-brown-200">
      <div className="relative min-w-0 flex-1 bg-brown-50/40">
        {isLoading ? (
          <CanvasMessage>Loading org chart…</CanvasMessage>
        ) : error ? (
          <CanvasMessage tone="error">Failed to load the org chart.</CanvasMessage>
        ) : forest.roots.length === 0 ? (
          <CanvasMessage>No people to display yet.</CanvasMessage>
        ) : (
          <OrgChartCanvas
            roots={forest.roots}
            collapsed={collapsed}
            selectedId={selectedId}
            onSelect={handleCanvasSelect}
            onToggleCollapse={toggleCollapse}
            recenterSignal={recenterNonce}
            canReparent={canReparent}
            canDrop={canDrop}
            onReparent={handleReparent}
          />
        )}

        {!panelOpen && !isLoading && !error && forest.roots.length > 0 && (
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            aria-label="Show panel"
            title="Show panel"
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-lg border border-brown-200 bg-white text-brown-500 shadow-sm transition-colors hover:text-brown-800"
          >
            <PanelRightOpen className="h-4 w-4" />
          </button>
        )}

        {canReparent && !isLoading && !error && forest.roots.length > 0 && (
          <div className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-lg border border-brown-200 bg-white/90 px-3 py-1.5 text-xs text-brown-500 shadow-sm">
            Drag a person onto another to change their manager.
          </div>
        )}
      </div>

      {panelOpen && (
        <div className="w-[360px] flex-none overflow-hidden border-l border-brown-200 bg-white">
          {selectedUser ? (
            <UserDetailPanel
              user={selectedUser}
              manager={manager}
              reports={reports}
              onSelect={handlePanelSelect}
              onCollapse={() => setPanelOpen(false)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
              <p className="text-sm font-medium text-brown-700">No one selected</p>
              <p className="text-sm text-brown-400">
                Click a person on the chart to see their details.
              </p>
            </div>
          )}
        </div>
      )}
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
