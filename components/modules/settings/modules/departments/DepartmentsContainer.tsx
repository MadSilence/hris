"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useCompanyData } from "@/components/providers/CompanyDataProvider/CompanyDataProvider";
import { useDepartmentTree } from "@/components/modules/settings/modules/departments/hooks/useDepartmentTree/useDepartmentTree";
import { useActivateDepartment } from "@/components/modules/settings/modules/departments/hooks/useActivateDepartment/useActivateDepartment";
import { DepartmentCanvas } from "@/components/modules/settings/modules/departments/components/DepartmentCanvas";
import { COMPANY_NODE_ID } from "@/components/modules/settings/modules/departments/components/DepartmentCanvas/CompanyNode";
import { DepartmentDetailsPanel } from "@/components/modules/settings/modules/departments/components/DepartmentDetailsPanel/DepartmentDetailsPanel";
import { CompanyDetailsPanel } from "@/components/modules/settings/modules/departments/components/CompanyDetailsPanel/CompanyDetailsPanel";
import { CreateDepartmentModal } from "@/components/modules/settings/modules/departments/components/modals/CreateDepartmentModal/CreateDepartmentModal";
import { EditDepartmentModal } from "@/components/modules/settings/modules/departments/components/modals/EditDepartmentModal/EditDepartmentModal";
import { DeleteDepartmentModal } from "@/components/modules/settings/modules/departments/components/modals/DeleteDepartmentModal/DeleteDepartmentModal";
import { ArchiveDepartmentModal } from "@/components/modules/settings/modules/departments/components/modals/ArchiveDepartmentModal/ArchiveDepartmentModal";
import type { DepartmentTreeNode } from "@/models/departments";

function flattenTree(nodes: DepartmentTreeNode[]): DepartmentTreeNode[] {
  const result: DepartmentTreeNode[] = [];
  function traverse(node: DepartmentTreeNode) {
    result.push(node);
    node.children?.forEach(traverse);
  }
  nodes.forEach(traverse);
  return result;
}

function findById(nodes: DepartmentTreeNode[], id: string): DepartmentTreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children?.length) {
      const found = findById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

function collectParentIds(nodes: DepartmentTreeNode[]): Set<string> {
  const ids = new Set<string>();
  function traverse(node: DepartmentTreeNode) {
    if (node.children?.length) {
      ids.add(node.id);
      node.children.forEach(traverse);
    }
  }
  nodes.forEach(traverse);
  return ids;
}

export default function DepartmentsContainer() {
  const { company } = useCompanyData();

  const [includeArchived, setIncludeArchived] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(COMPANY_NODE_ID);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [recenterNonce, setRecenterNonce] = useState(0);

  const [createParentId, setCreateParentId] = useState<string | null | undefined>(undefined);
  const [editTarget, setEditTarget] = useState<DepartmentTreeNode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DepartmentTreeNode | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<DepartmentTreeNode | null>(null);

  const { data: tree = [], isLoading, error } = useDepartmentTree(includeArchived);
  const activateDept = useActivateDepartment();

  const allFlat = flattenTree(tree);
  const totalMembers = allFlat.reduce((sum, node) => sum + node.memberCount, 0);
  const selectedDepartment =
    selectedId === COMPANY_NODE_ID ? null : findById(tree, selectedId);
  const selectedParentName = selectedDepartment?.parentId
    ? findById(tree, selectedDepartment.parentId)?.name ?? null
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
            <CanvasMessage>Loading departments…</CanvasMessage>
          ) : error ? (
            <CanvasMessage tone="error">Failed to load departments.</CanvasMessage>
          ) : tree.length === 0 ? (
            <CanvasMessage>
              <span>No departments yet.</span>
              <PermissionGate resource="ORG.DEPARTMENT" action="EDIT">
                <Button size="sm" onClick={() => setCreateParentId(null)} className="mt-3 gap-1.5">
                  <Plus className="h-4 w-4" />
                  Create your first department
                </Button>
              </PermissionGate>
            </CanvasMessage>
          ) : (
            <>
              <DepartmentCanvas
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
          {selectedDepartment ? (
            <DepartmentDetailsPanel
              department={selectedDepartment}
              parentName={selectedParentName}
              onEdit={() => setEditTarget(selectedDepartment)}
              onAddChild={() => setCreateParentId(selectedDepartment.id)}
              onArchive={() => setArchiveTarget(selectedDepartment)}
              onActivate={() => activateDept.mutate(selectedDepartment.id)}
              onDelete={() => setDeleteTarget(selectedDepartment)}
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
        <CreateDepartmentModal
          open
          onClose={() => setCreateParentId(undefined)}
          parentOptions={allFlat}
          defaultParentId={createParentId}
        />
      )}

      {editTarget && (
        <EditDepartmentModal
          open
          onClose={() => setEditTarget(null)}
          department={editTarget}
          parentOptions={allFlat}
        />
      )}

      {deleteTarget && (
        <DeleteDepartmentModal
          open
          onClose={() => setDeleteTarget(null)}
          department={deleteTarget}
          allDepartments={allFlat}
          onDeleted={() => {
            if (selectedId === deleteTarget.id) setSelectedId(COMPANY_NODE_ID);
          }}
        />
      )}

      {archiveTarget && (
        <ArchiveDepartmentModal
          open
          onClose={() => setArchiveTarget(null)}
          department={archiveTarget}
          allDepartments={allFlat}
          onArchived={() => {
            if (selectedId === archiveTarget.id) setSelectedId(COMPANY_NODE_ID);
          }}
        />
      )}
    </>
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
