"use client";

import React, { useState } from "react";
import { useDepartmentTree } from "@/components/modules/settings/modules/departments/hooks/useDepartmentTree/useDepartmentTree";
import { useArchiveDepartment } from "@/components/modules/settings/modules/departments/hooks/useArchiveDepartment/useArchiveDepartment";
import { useActivateDepartment } from "@/components/modules/settings/modules/departments/hooks/useActivateDepartment/useActivateDepartment";
import { DepartmentTree } from "@/components/modules/settings/modules/departments/components/DepartmentTree/DepartmentTree";
import { DepartmentDetailsPanel } from "@/components/modules/settings/modules/departments/components/DepartmentDetailsPanel/DepartmentDetailsPanel";
import { DepartmentTreeSkeleton } from "@/components/modules/settings/modules/departments/components/DepartmentTreeSkeleton/DepartmentTreeSkeleton";
import { CreateDepartmentModal } from "@/components/modules/settings/modules/departments/components/modals/CreateDepartmentModal/CreateDepartmentModal";
import { EditDepartmentModal } from "@/components/modules/settings/modules/departments/components/modals/EditDepartmentModal/EditDepartmentModal";
import { DeleteDepartmentModal } from "@/components/modules/settings/modules/departments/components/modals/DeleteDepartmentModal/DeleteDepartmentModal";
import { AssignDepartmentMemberModal } from "@/components/modules/settings/modules/departments/components/modals/AssignDepartmentMemberModal/AssignDepartmentMemberModal";
import { SetDepartmentLeadModal } from "@/components/modules/settings/modules/departments/components/modals/SetDepartmentLeadModal/SetDepartmentLeadModal";
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

export default function DepartmentsContainer() {
  const [includeArchived, setIncludeArchived] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<DepartmentTreeNode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DepartmentTreeNode | null>(null);
  const [addMemberTarget, setAddMemberTarget] = useState<string | null>(null);
  const [setLeadTarget, setSetLeadTarget] = useState<DepartmentTreeNode | null>(null);

  const { data: tree = [], isLoading, error } = useDepartmentTree(includeArchived);
  const archiveDept = useArchiveDepartment();
  const activateDept = useActivateDepartment();

  const allFlat = flattenTree(tree);
  const selected = selectedId ? findById(tree, selectedId) : null;
  const effectiveSelected = selected ?? (tree[0] ?? null);

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Archived toggle */}
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
          {/* Tree */}
          <div className="w-72 flex-none border border-brown-200 rounded-xl bg-white overflow-hidden flex flex-col min-h-0">
            {isLoading ? (
              <DepartmentTreeSkeleton />
            ) : error ? (
              <div className="flex items-center justify-center h-20 text-sm text-red-500 px-4 text-center">
                Failed to load departments.
              </div>
            ) : (
              <DepartmentTree
                data={tree}
                selectedId={selectedId ?? (effectiveSelected?.id ?? null)}
                defaultExpandedIds={tree.slice(0, 3).map((n) => n.id)}
                onSelect={setSelectedId}
                onAdd={() => setShowCreate(true)}
                onEdit={(node) => setEditTarget(node)}
                onArchive={(node) => archiveDept.mutate(node.id)}
                onActivate={(node) => activateDept.mutate(node.id)}
                onDelete={(node) => setDeleteTarget(node)}
              />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 border border-brown-200 rounded-xl bg-white overflow-hidden flex flex-col min-h-0">
            {effectiveSelected ? (
              <DepartmentDetailsPanel
                department={effectiveSelected}
                onEdit={() => setEditTarget(effectiveSelected)}
                onAddMember={() => setAddMemberTarget(effectiveSelected.id)}
                onSetLead={() => setSetLeadTarget(effectiveSelected)}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-brown-400">
                {isLoading ? null : "No departments yet. Create your first department."}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreate && (
        <CreateDepartmentModal
          open
          onClose={() => setShowCreate(false)}
          parentOptions={allFlat}
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
            if (selectedId === deleteTarget.id) setSelectedId(null);
          }}
        />
      )}

      {addMemberTarget && (
        <AssignDepartmentMemberModal
          open
          onClose={() => setAddMemberTarget(null)}
          departmentId={addMemberTarget}
        />
      )}

      {setLeadTarget && (
        <SetDepartmentLeadModal
          open
          onClose={() => setSetLeadTarget(null)}
          departmentId={setLeadTarget.id}
          currentLeadId={setLeadTarget.leadId}
        />
      )}
    </>
  );
}
