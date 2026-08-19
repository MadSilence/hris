"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LayoutGrid, Network, Pencil, Plus } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import { Button } from "@/public/desact/src/components/ui/button";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useAccess } from "@/components/auth/useAccess";
import { canAccess } from "@/models/access";
import { Tabs, TabsList, TabsTrigger } from "@/public/desact/src/components/ui/tabs";
import { useUrlState } from "@/components/utils/useUrlState";
import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue/useDebouncedValue";
import { useCompanyData } from "@/components/providers/CompanyDataProvider/CompanyDataProvider";
import { useDepartmentTree } from "@/components/modules/settings/modules/departments/hooks/useDepartmentTree/useDepartmentTree";
import { useDepartmentSummary } from "@/components/modules/settings/modules/departments/hooks/useDepartmentSummary/useDepartmentSummary";
import { useDepartmentPeople } from "@/components/modules/settings/modules/departments/hooks/useDepartmentPeople/useDepartmentPeople";
import { useDepartmentMembership } from "@/components/modules/settings/modules/departments/hooks/useDepartmentMembership/useDepartmentMembership";
import { useDepartmentSearch } from "@/components/modules/settings/modules/departments/hooks/useDepartmentSearch/useDepartmentSearch";
import { useActivateDepartment } from "@/components/modules/settings/modules/departments/hooks/useActivateDepartment/useActivateDepartment";
import { useMoveDepartment } from "@/components/modules/settings/modules/departments/hooks/useMoveDepartment/useMoveDepartment";
import { useMovePersonToDepartment } from "@/components/modules/settings/modules/departments/hooks/useMovePersonToDepartment/useMovePersonToDepartment";
import { DepartmentCanvas } from "@/components/modules/settings/modules/departments/components/DepartmentCanvas";
import { COMPANY_NODE_ID } from "@/components/modules/settings/modules/departments/components/DepartmentCanvas/CompanyNode";
import { DepartmentBlocksView } from "@/components/modules/settings/modules/departments/components/DepartmentBlocksView/DepartmentBlocksView";
import type { DepartmentBlocksHandlers } from "@/components/modules/settings/modules/departments/components/DepartmentBlocksView/DepartmentBlocksContext";
import { CARD_H } from "@/components/modules/settings/modules/departments/components/DepartmentBlocksView/DepartmentBlockNode";
import {
  DepartmentSearchBar,
  type DepartmentSearchMode,
} from "@/components/modules/settings/modules/departments/components/DepartmentSearchBar/DepartmentSearchBar";
import { DepartmentDetailsPanel } from "@/components/modules/settings/modules/departments/components/DepartmentDetailsPanel/DepartmentDetailsPanel";
import { CompanyDetailsPanel } from "@/components/modules/settings/modules/departments/components/CompanyDetailsPanel/CompanyDetailsPanel";
import { DepartmentUnassignedTab } from "@/components/modules/settings/modules/departments/components/DepartmentUnassignedTab/DepartmentUnassignedTab";
import { DepartmentPersonPanel } from "@/components/modules/settings/modules/departments/components/DepartmentPersonPanel/DepartmentPersonPanel";
import { CreateDepartmentModal } from "@/components/modules/settings/modules/departments/components/modals/CreateDepartmentModal/CreateDepartmentModal";
import { EditDepartmentModal } from "@/components/modules/settings/modules/departments/components/modals/EditDepartmentModal/EditDepartmentModal";
import { DeleteDepartmentModal } from "@/components/modules/settings/modules/departments/components/modals/DeleteDepartmentModal/DeleteDepartmentModal";
import { ArchiveDepartmentModal } from "@/components/modules/settings/modules/departments/components/modals/ArchiveDepartmentModal/ArchiveDepartmentModal";
import { MoveDepartmentModal } from "@/components/modules/settings/modules/departments/components/modals/MoveDepartmentModal/MoveDepartmentModal";
import { MovePersonModal } from "@/components/modules/settings/modules/departments/components/modals/MovePersonModal/MovePersonModal";
import { DraggablePersonChip } from "@/components/modules/settings/modules/departments/components/DepartmentBlocksView/DraggablePersonChip";
import { DroppableBlockZone } from "@/components/modules/settings/modules/departments/components/DepartmentBlocksView/DroppableBlockZone";
import { underPointer } from "@/components/modules/settings/modules/departments/utils/blockCollision";
import { personDisplayName } from "@/components/modules/settings/modules/departments/utils/personDisplay";
import type { DepartmentPerson, DepartmentTreeNode } from "@/models/departments";

/** Mirrors MAX_DEPTH on the backend: a deeper drop is refused before the request is made. */
const MAX_DEPTH = 10;
/** Drop id of the Unassigned panel: dropping there takes the person out of the structure. */
const UNASSIGNED_DROP_ID = "unassigned";

type ViewMode = "chart" | "blocks";
type PanelMode = "details" | "unassigned";

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
  const { params, setParams } = useUrlState();
  const { access } = useAccess();
  const canSeePeople = canAccess({ access, resource: "PEOPLE.PROFILE", action: "VIEW" });
  const canEdit = canAccess({ access, resource: "ORG.DEPARTMENT", action: "EDIT" });

  const [view, setView] = useState<ViewMode>(params.get("view") === "blocks" ? "blocks" : "chart");
  const [includeArchived, setIncludeArchived] = useState(params.get("archived") === "1");
  const [selectedId, setSelectedId] = useState<string>(params.get("node") ?? COMPANY_NODE_ID);
  const [selectedPerson, setSelectedPerson] = useState<DepartmentPerson | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>("details");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  // Blocks that had their “+N more” unfolded; kept here so the layout can re-measure them.
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const [editModes, setEditModes] = useState<Record<ViewMode, boolean>>(() => ({
    chart: params.get("edit") === "1" && params.get("view") !== "blocks",
    blocks: params.get("edit") === "1" && params.get("view") === "blocks",
  }));
  const editMode = editModes[view];
  const setEditMode = useCallback(
    (next: boolean) => setEditModes((prev) => ({ ...prev, [view]: next })),
    [view],
  );
  const [moveRequest, setMoveRequest] = useState<{
    department: DepartmentTreeNode;
    target: DepartmentTreeNode | null;
  } | null>(null);
  const [personMove, setPersonMove] = useState<{
    person: DepartmentPerson;
    sourceDepartmentId: string | null;
    targetDepartmentId: string | null;
  } | null>(null);
  const [recenterNonce, setRecenterNonce] = useState(0);

  const [searchMode, setSearchMode] = useState<DepartmentSearchMode>(
    params.get("mode") === "people" && canSeePeople ? "people" : "units",
  );
  const [query, setQuery] = useState(params.get("q") ?? "");
  const debouncedQuery = useDebouncedValue(query, 250);
  const [activeMatchIdx, setActiveMatchIdx] = useState(0);
  const [peopleFocus, setPeopleFocus] = useState<{ userId: string; name: string } | null>(null);

  const [createParentId, setCreateParentId] = useState<string | null | undefined>(undefined);
  const [editTarget, setEditTarget] = useState<DepartmentTreeNode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DepartmentTreeNode | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<DepartmentTreeNode | null>(null);

  const { data: tree = [], isLoading, error } = useDepartmentTree(includeArchived);
  const { data: summary } = useDepartmentSummary(includeArchived);
  const { data: people = [], isLoading: peopleLoading } = useDepartmentPeople(canSeePeople);
  const membership = useDepartmentMembership(people);
  const activateDept = useActivateDepartment();
  const moveDepartment = useMoveDepartment();
  const movePerson = useMovePersonToDepartment();

  const allFlat = flattenTree(tree);
  // People on the company card = distinct people placed in the structure, straight from the
  // backend. Summing node counts would double-count anyone holding more than one membership.
  const peopleAssigned = summary?.peopleAssigned ?? 0;
  const selectedDepartment =
    selectedId === COMPANY_NODE_ID ? null : findById(tree, selectedId);
  const selectedParentName = selectedDepartment?.parentId
    ? findById(tree, selectedDepartment.parentId)?.name ?? null
    : null;
  const isCreateOpen = createParentId !== undefined;

  const unitSearch = useDepartmentSearch(tree, searchMode === "units" ? debouncedQuery : "");

  const departmentNameById = useMemo(() => {
    const map = new Map<string, string>();
    allFlat.forEach((node) => map.set(node.id, node.name));
    return map;
  }, [allFlat]);

  const peopleResults = useMemo(() => {
    const term = debouncedQuery.trim().toLowerCase();
    if (searchMode !== "people" || !term) return [];
    return people.filter((person) =>
      `${personDisplayName(person)} ${person.email}`.toLowerCase().includes(term),
    );
  }, [people, debouncedQuery, searchMode]);

  const matchedPersonIds = useMemo(
    () => new Set(peopleResults.map((person) => person.id)),
    [peopleResults],
  );

  // The URL mirrors the toolbar so a link reproduces the screen.
  useEffect(() => {
    setParams({
      view: view === "blocks" ? "blocks" : null,
      q: debouncedQuery || null,
      mode: searchMode === "people" ? "people" : null,
      node: selectedId === COMPANY_NODE_ID ? null : selectedId,
      archived: includeArchived ? "1" : null,
      edit: editMode ? "1" : null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, debouncedQuery, searchMode, selectedId, includeArchived, editMode]);

  const didInitCollapse = useRef(false);
  useEffect(() => {
    if (didInitCollapse.current || isLoading) return;
    didInitCollapse.current = true;
    setCollapsed(collectParentIds(tree));
  }, [isLoading, tree]);

  const toggleExpandedBlock = useCallback((id: string) => {
    setExpandedBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleCollapse = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /** Opens every ancestor of a node so a picked search result is actually on screen. */
  const revealNode = useCallback(
    (nodeId: string) => {
      const ancestors = unitSearch.ancestorsById.get(nodeId);
      if (!ancestors?.length) return;
      setCollapsed((prev) => {
        if (!ancestors.some((id) => prev.has(id))) return prev;
        const next = new Set(prev);
        ancestors.forEach((id) => next.delete(id));
        return next;
      });
    },
    [unitSearch.ancestorsById],
  );

  const focusMatch = useCallback(
    (index: number) => {
      const { matchIds } = unitSearch;
      if (matchIds.length === 0) return;
      const next = (index + matchIds.length) % matchIds.length;
      setActiveMatchIdx(next);
      revealNode(matchIds[next]);
      setSelectedId(matchIds[next]);
      setRecenterNonce((n) => n + 1);
    },
    [unitSearch, revealNode],
  );

  // A fresh set of hits starts at the first one. Nothing is selected or expanded until the person
  // picks a result — typing only highlights.
  const lastMatchKey = useRef("");
  useEffect(() => {
    const key = unitSearch.matchIds.join(",");
    if (key === lastMatchKey.current) return;
    lastMatchKey.current = key;
    setActiveMatchIdx(0);
  }, [unitSearch.matchIds]);

  // Everything a drop has to know about the tree: who sits under whom, and how deep.
  const treeShape = useMemo(() => {
    const descendants = new Map<string, Set<string>>();
    const depth = new Map<string, number>();
    const height = new Map<string, number>();

    const walk = (node: DepartmentTreeNode, level: number): Set<string> => {
      depth.set(node.id, level);
      const below = new Set<string>();
      let maxChildHeight = 0;
      for (const child of node.children ?? []) {
        below.add(child.id);
        const childBelow = walk(child, level + 1);
        childBelow.forEach((id) => below.add(id));
        maxChildHeight = Math.max(maxChildHeight, height.get(child.id) ?? 1);
      }
      descendants.set(node.id, below);
      height.set(node.id, 1 + maxChildHeight);
      return below;
    };
    tree.forEach((root) => walk(root, 1));

    return { descendants, depth, height };
  }, [tree]);

  const canDrop = useCallback(
    (draggedId: string, targetId: string) => {
      if (draggedId === COMPANY_NODE_ID || draggedId === targetId) return false;
      const dragged = findById(tree, draggedId);
      if (!dragged || dragged.status === "ARCHIVED") return false;

      // Dropping on the company card means "make it top-level".
      if (targetId === COMPANY_NODE_ID) return dragged.parentId !== null;

      const target = findById(tree, targetId);
      if (!target || target.status === "ARCHIVED") return false;
      if (dragged.parentId === targetId) return false;
      if (treeShape.descendants.get(draggedId)?.has(targetId)) return false;

      const targetDepth = treeShape.depth.get(targetId) ?? 1;
      const draggedHeight = treeShape.height.get(draggedId) ?? 1;
      return targetDepth + draggedHeight <= MAX_DEPTH;
    },
    [tree, treeShape],
  );

  const handleDropRequest = useCallback(
    (draggedId: string, targetId: string) => {
      const dragged = findById(tree, draggedId);
      if (!dragged) return;
      const target = targetId === COMPANY_NODE_ID ? null : findById(tree, targetId);
      moveDepartment.reset();
      setMoveRequest({ department: dragged, target });
    },
    [tree, moveDepartment],
  );

  const handleSelectDepartment = useCallback((id: string) => {
    setSelectedId(id);
    setSelectedPerson(null);
    setPeopleFocus(null);
    setPanelMode("details");
  }, []);

  const handleSelectPerson = useCallback((person: DepartmentPerson) => {
    setSelectedPerson(person);
    setPanelMode("details");
  }, []);

  const handlePersonSearchSelect = useCallback(
    (person: DepartmentPerson) => {
      if (view === "blocks") {
        setSelectedPerson(person);
        setPanelMode("details");
        return;
      }
      if (!person.departmentId) {
        setSelectedId(COMPANY_NODE_ID);
        setSelectedPerson(person);
        setPanelMode("details");
        return;
      }
      revealNode(person.departmentId);
      setSelectedId(person.departmentId);
      setSelectedPerson(null);
      setPeopleFocus({ userId: person.id, name: personDisplayName(person) });
      setRecenterNonce((n) => n + 1);
    },
    [view, revealNode],
  );

  const handleModeChange = useCallback((mode: DepartmentSearchMode) => {
    setSearchMode(mode);
    setActiveMatchIdx(0);
  }, []);

  const dndEnabled = view === "blocks" && editMode && canEdit;
  const sensors = useSensors(
    // A few pixels of travel keep a plain click on a chip from starting a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handlePersonDragEnd = useCallback(
    (event: DragEndEvent) => {
      const person = event.active.data.current?.person as DepartmentPerson | undefined;
      const sourceDepartmentId =
        (event.active.data.current?.sourceDepartmentId as string | null | undefined) ?? null;
      const overId = event.over ? String(event.over.id) : null;
      if (!person || !overId) return;

      if (overId === UNASSIGNED_DROP_ID) {
        if (!sourceDepartmentId) return;
        movePerson.reset();
        setPersonMove({ person, sourceDepartmentId, targetDepartmentId: null });
        return;
      }

      if (overId === person.departmentId) return; // already there, nothing to confirm
      const target = findById(tree, overId);
      if (!target || target.status === "ARCHIVED") return;

      movePerson.reset();
      setPersonMove({ person, sourceDepartmentId, targetDepartmentId: overId });
    },
    [tree, movePerson],
  );

  const blocksHandlers: DepartmentBlocksHandlers = useMemo(
    () => ({
      selectedPersonId: selectedPerson?.id ?? null,
      matchedPersonIds,
      onSelectDepartment: handleSelectDepartment,
      onSelectPerson: handleSelectPerson,
      onToggleCollapse: toggleCollapse,
      onToggleExpanded: toggleExpandedBlock,
      isBranchCollapsed: (id: string) => collapsed.has(id),
      renderPersonChip: dndEnabled
        ? (person, node) => (
            <DraggablePersonChip
              person={person}
              sourceDepartmentId={node.id}
              variant="card"
              height={CARD_H}
              selected={selectedPerson?.id === person.id}
              matched={matchedPersonIds.has(person.id)}
              badge={node.leadId === person.id ? "Lead" : undefined}
              onClick={() => handleSelectPerson(person)}
            />
          )
        : undefined,
      renderDropZone: dndEnabled
        ? (node, children) => (
            <DroppableBlockZone id={node.id} disabled={node.status === "ARCHIVED"}>
              {children}
            </DroppableBlockZone>
          )
        : undefined,
    }),
    [
      selectedPerson,
      matchedPersonIds,
      handleSelectDepartment,
      handleSelectPerson,
      toggleCollapse,
      toggleExpandedBlock,
      collapsed,
      dndEnabled,
    ],
  );

  const companyName = company?.name ?? "Company";
  const companyLogo = company?.companyLogo ?? null;
  const searchActive = searchMode === "units" && debouncedQuery.trim().length > 0;
  const noUnitMatches = searchActive && unitSearch.matchIds.length === 0;

  const renderCanvasArea = () => {
    if (isLoading) return <CanvasLoading label="Loading departments…" />;
    if (error) return <CanvasMessage tone="error">Failed to load departments.</CanvasMessage>;
    if (tree.length === 0) {
      return (
        <CanvasMessage>
          <span>No departments yet.</span>
          <PermissionGate resource="ORG.DEPARTMENT" action="EDIT">
            <Button size="sm" onClick={() => setCreateParentId(null)} className="mt-3 gap-1.5">
              <Plus className="h-4 w-4" />
              Create your first department
            </Button>
          </PermissionGate>
        </CanvasMessage>
      );
    }

    if (view === "blocks") {
      return (
        <DepartmentBlocksView
          tree={tree}
          peopleByDepartment={membership.byDepartment}
          company={{ name: companyName, logo: companyLogo, peopleAssigned }}
          collapsed={collapsed}
          expanded={expandedBlocks}
          selectedId={selectedId}
          matchedIds={unitSearch.matchSet}
          searchActive={searchActive}
          handlers={blocksHandlers}
          banner={
            dndEnabled ? (
              <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-lg border border-brown-200 bg-white/90 px-3 py-1.5 text-xs text-brown-500 shadow-sm">
                Drag a person onto another department to move them. Drop them on the Unassigned
                tab to take them out.
              </div>
            ) : null
          }
        />
      );
    }

    return (
      <>
        <DepartmentCanvas
          tree={tree}
          company={{ name: companyName, logo: companyLogo, memberCount: peopleAssigned }}
          collapsed={collapsed}
          selectedId={selectedId}
          onSelect={handleSelectDepartment}
          onToggleCollapse={toggleCollapse}
          recenterSignal={recenterNonce}
          matchedIds={unitSearch.matchSet}
          searchActive={searchActive}
          editMode={editMode && canEdit}
          canDrop={canDrop}
          onDropRequest={handleDropRequest}
        />

        {editMode && canEdit && (
          <div className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-lg border border-brown-200 bg-white/90 px-3 py-1.5 text-xs text-brown-500 shadow-sm">
            Drag a department onto another to move it. Drop it on the company card to make it
            top-level.
          </div>
        )}

        {noUnitMatches && (
          <div className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-lg border border-brown-200 bg-white px-3 py-1.5 text-sm text-brown-500 shadow-sm">
            No departments match “{debouncedQuery}”
          </div>
        )}
      </>
    );
  };

  const renderPanel = () => {
    if (panelMode === "unassigned") {
      return (
        <DepartmentUnassignedTab
          people={membership.unassigned}
          isLoading={peopleLoading}
          selectedPersonId={selectedPerson?.id ?? null}
          onSelectPerson={handleSelectPerson}
          renderPersonChip={
            dndEnabled
              ? (person) => (
                  <DraggablePersonChip
                    person={person}
                    sourceDepartmentId={null}
                    selected={selectedPerson?.id === person.id}
                    onClick={() => handleSelectPerson(person)}
                  />
                )
              : undefined
          }
        />
      );
    }

    if (selectedPerson) {
      return (
        <DepartmentPersonPanel
          person={selectedPerson}
          departmentName={
            selectedPerson.departmentId
              ? departmentNameById.get(selectedPerson.departmentId) ?? null
              : null
          }
          onBack={() => setSelectedPerson(null)}
        />
      );
    }

    if (selectedDepartment) {
      return (
        <DepartmentDetailsPanel
          department={selectedDepartment}
          parentName={selectedParentName}
          peopleFocus={peopleFocus}
          onEdit={() => setEditTarget(selectedDepartment)}
          onAddChild={() => setCreateParentId(selectedDepartment.id)}
          onArchive={() => setArchiveTarget(selectedDepartment)}
          onActivate={() => activateDept.mutate(selectedDepartment.id)}
          onDelete={() => setDeleteTarget(selectedDepartment)}
          onRecenter={() => setRecenterNonce((n) => n + 1)}
        />
      );
    }

    return (
      <CompanyDetailsPanel
        name={companyName}
        logo={companyLogo}
        topLevelCount={tree.length}
        totalCount={allFlat.length}
      />
    );
  };

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar: view on the left, search in the middle, actions on the right */}
      <div className="mb-3 flex flex-none items-center gap-3">
        <Tabs value={view} onValueChange={(next) => setView(next as ViewMode)}>
          <TabsList className="grid h-9 w-[220px] grid-cols-2 bg-brown-50">
            <TabsTrigger value="chart" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Chart
            </TabsTrigger>
            <TabsTrigger value="blocks" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Blocks
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex min-w-0 flex-1 justify-center">

        <DepartmentSearchBar
          mode={searchMode}
          onModeChange={handleModeChange}
          query={query}
          onQueryChange={setQuery}
          unitMatchCount={unitSearch.matchIds.length}
          activeMatch={activeMatchIdx + 1}
          onPrevMatch={() => focusMatch(activeMatchIdx - 1)}
          onNextMatch={() => focusMatch(activeMatchIdx + 1)}
          peopleResults={peopleResults.slice(0, 50)}
          peopleLoading={peopleLoading}
          onPersonSelect={handlePersonSearchSelect}
          departmentNameById={departmentNameById}
          canSearchPeople={canSeePeople}
          />
        </div>

        <div className="flex flex-none items-center gap-3">
          {canEdit && (
            <Button
              type="button"
              onClick={() => setEditMode(!editMode)}
              variant={editMode ? "outline" : "default"}
              className="h-9 gap-1.5"
            >
              <Pencil className="h-4 w-4" />
              {editMode ? "Done" : "Edit"}
            </Button>
          )}

          <label className="flex h-9 cursor-pointer select-none items-center gap-2 text-sm text-brown-700">
            <Checkbox
              checked={includeArchived}
              onCheckedChange={(v) => setIncludeArchived(v === true)}
            />
            Show archived
          </label>
        </div>
      </div>

      {/* Canvas / blocks + docked panel (flush, one unified surface) */}
      <DndContext
        sensors={sensors}
        collisionDetection={underPointer}
        onDragEnd={handlePersonDragEnd}
      >
        <div className="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-brown-200">
          <div className="relative min-w-0 flex-1 bg-brown-50/40">{renderCanvasArea()}</div>

          <div className="flex w-[380px] flex-none flex-col overflow-hidden border-l border-brown-200 bg-white">
            {canSeePeople && (
              <div className="flex-none border-b border-brown-200 px-4 py-2.5">
              <Tabs value={panelMode} onValueChange={(next) => setPanelMode(next as PanelMode)}>
                <TabsList className="grid h-9 w-full grid-cols-2 bg-brown-50">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="unassigned" className="flex items-center gap-1.5">
                    Unassigned
                    <span className="rounded bg-brown-200/60 px-1 text-[10px] leading-4 tabular-nums text-brown-600">
                      {membership.unassigned.length}
                    </span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-hidden">
              {dndEnabled && panelMode === "unassigned" ? (
                <DroppableBlockZone id={UNASSIGNED_DROP_ID} className="h-full">
                  {renderPanel()}
                </DroppableBlockZone>
              ) : (
                renderPanel()
              )}
            </div>
          </div>
        </div>
      </DndContext>

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

      {moveRequest && (
        <MoveDepartmentModal
          open
          onClose={() => setMoveRequest(null)}
          department={moveRequest.department}
          target={moveRequest.target}
          isPending={moveDepartment.isPending}
          errorMessage={
            moveDepartment.isError ? (moveDepartment.error as Error)?.message : null
          }
          onConfirm={() => {
            moveDepartment.mutate(
              {
                id: moveRequest.department.id,
                parentId: moveRequest.target?.id ?? null,
              },
              { onSuccess: () => setMoveRequest(null) },
            );
          }}
        />
      )}

      {personMove && (
        <MovePersonModal
          open
          onClose={() => setPersonMove(null)}
          personName={personDisplayName(personMove.person)}
          sourceName={
            personMove.sourceDepartmentId
              ? departmentNameById.get(personMove.sourceDepartmentId) ?? null
              : null
          }
          targetName={
            personMove.targetDepartmentId
              ? departmentNameById.get(personMove.targetDepartmentId) ?? null
              : null
          }
          isPending={movePerson.isPending}
          errorMessage={movePerson.isError ? (movePerson.error as Error)?.message : null}
          onConfirm={() => {
            movePerson.mutate(
              {
                userId: personMove.person.id,
                targetDepartmentId: personMove.targetDepartmentId,
                sourceDepartmentId: personMove.sourceDepartmentId,
              },
              { onSuccess: () => setPersonMove(null) },
            );
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
    </div>
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
        {/* root node */}
        <div className="flex w-56 items-center gap-3 rounded-xl border border-brown-200 bg-white p-3 shadow-sm">
          <div className="h-9 w-9 flex-none rounded-lg bg-brown-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-28 rounded bg-brown-100" />
            <div className="h-2.5 w-16 rounded bg-brown-100" />
          </div>
        </div>
        {/* connectors */}
        <div className="h-6 w-px bg-brown-200" />
        <div className="h-px w-64 bg-brown-200" />
        {/* children */}
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
