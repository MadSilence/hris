"use client";

import { FC, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronsDownUp,
  ChevronsUpDown,
  ChevronDown,
  ChevronUp,
  Download,
  Ellipsis,
  GripVertical,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Input } from "@/public/desact/src/components/ui/input";
import { Button } from "@/public/desact/src/components/ui/button";
import { Badge } from "@/public/desact/src/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/public/desact/src/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/public/desact/src/components/ui/dropdown-menu";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AttributeGroup } from "@/models/attribute/AttributeGroup";
import { Attribute } from "@/models/attribute/Attribute";
import { sortBySortOrder } from "@/components/modules/settings/modules/attributes/hooks/utils/useReorderAction";
import { getAttributeTypeLabel } from "@/components/modules/settings/modules/attributes/utils/attributeTypeUtils";
import { AttributeOptions } from "@/components/modules/settings/modules/attributes/components/AttributeOptions";
import { ExportDataModal } from "@/components/modules/settings/shared/ExportDataModal/ExportDataModal";

type AttributeGroupsComponentProps = {
  groups: AttributeGroup[] | null | undefined;
  onCreateGroup: () => void;
  onRenameGroup: (group: AttributeGroup) => void;
  onDeleteGroup: (group: AttributeGroup) => void;
  onCreateAttribute: (group: AttributeGroup) => void;
  onDeleteAttribute: (attribute: Attribute) => void;
  onSaveAttribute: (id: string, patch: Partial<Attribute>) => void;
  isSavingAttribute?: boolean;
  onReorderGroups: (orderedIds: string[]) => void;
  onReorderAttributes: (groupId: string, orderedIds: string[]) => void;
  onMoveAttribute: (attributeId: string, targetGroupId: string, targetOrderedIds: string[]) => void;
};

const GRID =
  "grid grid-cols-[minmax(0,1fr)_150px_110px_150px_120px] items-center gap-4";

const DROP_PREFIX = "dropzone:";

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function normalize(groups: AttributeGroup[]): AttributeGroup[] {
  return sortBySortOrder(groups).map((g) => ({
    ...g,
    attributes: sortBySortOrder(g.attributes ?? []),
  }));
}

export const AttributeGroupsComponent: FC<AttributeGroupsComponentProps> = ({
  groups,
  onCreateGroup,
  onRenameGroup,
  onDeleteGroup,
  onCreateAttribute,
  onDeleteAttribute,
  onSaveAttribute,
  isSavingAttribute,
  onReorderGroups,
  onReorderAttributes,
  onMoveAttribute,
}) => {
  const propGroups = groups ?? [];

  const [query, setQuery] = useState("");
  const [openIds, setOpenIds] = useState<string[]>(() => propGroups.map((g) => g.id));
  const [expandedAttrId, setExpandedAttrId] = useState<string>("");
  const [isExportOpen, setIsExportOpen] = useState(false);

  const [localGroups, setLocalGroups] = useState<AttributeGroup[]>(() => normalize(propGroups));
  const [activeId, setActiveId] = useState<string | null>(null);
  const draggingRef = useRef(false);
  const dragSourceGroupRef = useRef<string | null>(null);
  const draftRef = useRef<Partial<Attribute>>({});

  useEffect(() => {
    if (draggingRef.current) return;
    setLocalGroups(normalize(groups ?? []));
  }, [groups]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const needle = query.trim().toLowerCase();
  const dndEnabled = needle.length === 0;

  const display = useMemo(() => {
    if (!needle) return localGroups;

    return localGroups
      .map((group) => {
        const groupMatches = group.name.toLowerCase().includes(needle);
        const attributes = groupMatches
          ? group.attributes
          : (group.attributes ?? []).filter(
              (attr) =>
                attr.name.toLowerCase().includes(needle) ||
                getAttributeTypeLabel(attr.type).toLowerCase().includes(needle),
            );

        return { ...group, attributes };
      })
      .filter(
        (group) =>
          group.name.toLowerCase().includes(needle) ||
          (group.attributes?.length ?? 0) > 0,
      );
  }, [localGroups, needle]);

  const allOpen = display.length > 0 && openIds.length >= display.length;
  const toggleAll = () => setOpenIds(allOpen ? [] : display.map((g) => g.id));

  const toggleAttr = (id: string) => {
    draftRef.current = {};
    setExpandedAttrId((current) => (current === id ? "" : id));
  };

  // --- DnD helpers ---------------------------------------------------------

  const isGroupId = (id: string) => localGroups.some((g) => g.id === id);

  const findContainer = (id: string): string | undefined => {
    if (id.startsWith(DROP_PREFIX)) return id.slice(DROP_PREFIX.length);
    if (isGroupId(id)) return id;
    return localGroups.find((g) => (g.attributes ?? []).some((a) => a.id === id))?.id;
  };

  const activeAttribute = useMemo(() => {
    if (!activeId || isGroupId(activeId)) return null;
    for (const g of localGroups) {
      const found = (g.attributes ?? []).find((a) => a.id === activeId);
      if (found) return found;
    }
    return null;
  }, [activeId, localGroups]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeGroup = useMemo(
    () => (activeId && isGroupId(activeId) ? localGroups.find((g) => g.id === activeId) ?? null : null),
    [activeId, localGroups] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleDragStart = (e: DragStartEvent) => {
    const id = String(e.active.id);
    draggingRef.current = true;
    setActiveId(id);
    dragSourceGroupRef.current = isGroupId(id) ? null : findContainer(id) ?? null;
  };

  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e;
    if (!over) return;
    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);
    if (isGroupId(activeIdStr)) return; // groups only reorder on drop

    const from = findContainer(activeIdStr);
    const to = findContainer(overIdStr);
    if (!from || !to || from === to) return;

    setLocalGroups((prev) => {
      const fromG = prev.find((g) => g.id === from);
      const toG = prev.find((g) => g.id === to);
      const attr = fromG?.attributes?.find((a) => a.id === activeIdStr);
      if (!fromG || !toG || !attr) return prev;

      const nextFrom = fromG.attributes.filter((a) => a.id !== activeIdStr);

      let insertIndex = toG.attributes.length;
      if (!overIdStr.startsWith(DROP_PREFIX) && !isGroupId(overIdStr)) {
        const idx = toG.attributes.findIndex((a) => a.id === overIdStr);
        if (idx >= 0) insertIndex = idx;
      }
      const nextTo = [
        ...toG.attributes.slice(0, insertIndex),
        attr,
        ...toG.attributes.slice(insertIndex),
      ];

      return prev.map((g) =>
        g.id === from ? { ...g, attributes: nextFrom } : g.id === to ? { ...g, attributes: nextTo } : g
      );
    });
  };

  const endDrag = () => {
    draggingRef.current = false;
    setActiveId(null);
    dragSourceGroupRef.current = null;
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    const activeIdStr = String(active.id);

    if (!over) {
      setLocalGroups(normalize(propGroups)); // revert
      endDrag();
      return;
    }
    const overIdStr = String(over.id);

    // --- Group reorder ---
    if (isGroupId(activeIdStr)) {
      const targetGroupId = isGroupId(overIdStr) ? overIdStr : findContainer(overIdStr);
      const oldIndex = localGroups.findIndex((g) => g.id === activeIdStr);
      const newIndex = localGroups.findIndex((g) => g.id === targetGroupId);
      if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
        const next = arrayMove(localGroups, oldIndex, newIndex);
        setLocalGroups(next);
        onReorderGroups(next.map((g) => g.id));
      }
      endDrag();
      return;
    }

    // --- Attribute reorder / cross-group move ---
    const targetGroupId = findContainer(overIdStr);
    if (!targetGroupId) {
      endDrag();
      return;
    }

    const next = localGroups.map((g) => {
      if (g.id !== targetGroupId) return g;
      const items = g.attributes ?? [];
      const oldIndex = items.findIndex((a) => a.id === activeIdStr);
      if (oldIndex < 0) return g; // not here (shouldn't happen after dragOver)
      let newIndex =
        overIdStr.startsWith(DROP_PREFIX) || isGroupId(overIdStr)
          ? items.length - 1
          : items.findIndex((a) => a.id === overIdStr);
      if (newIndex < 0) newIndex = items.length - 1;
      return { ...g, attributes: arrayMove(items, oldIndex, newIndex) };
    });
    setLocalGroups(next);

    const sourceGroupId = dragSourceGroupRef.current;
    const targetOrdered = (next.find((g) => g.id === targetGroupId)?.attributes ?? []).map((a) => a.id);

    if (sourceGroupId && sourceGroupId !== targetGroupId) {
      onMoveAttribute(activeIdStr, targetGroupId, targetOrdered);
      const sourceOrdered = (next.find((g) => g.id === sourceGroupId)?.attributes ?? []).map((a) => a.id);
      if (sourceOrdered.length) onReorderAttributes(sourceGroupId, sourceOrdered);
    } else {
      onReorderAttributes(targetGroupId, targetOrdered);
    }

    endDrag();
  };

  // --- Render --------------------------------------------------------------

  return (
    // Fixed top region (search + column header) stays put; only the list below scrolls.
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-400"/>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search attributes"
            className="pl-9 w-[260px] h-9"
            inputMode="search"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 text-brown-600"
            onClick={toggleAll}
            disabled={display.length === 0}
          >
            {allOpen ? <ChevronsDownUp className="h-4 w-4"/> : <ChevronsUpDown className="h-4 w-4"/>}
            {allOpen ? "Collapse all" : "Expand all"}
          </Button>

          <PermissionGate resource="PEOPLE.ATTRIBUTES" action="EDIT">
            <Button className="gap-1.5" onClick={onCreateGroup}>
              <Plus className="h-4 w-4"/>
              Add Section
            </Button>
          </PermissionGate>

          <Button
            size="icon"
            variant="outline"
            className="h-9 w-9"
            onClick={() => setIsExportOpen(true)}
            aria-label="Export attributes"
          >
            <Download className="h-4 w-4"/>
          </Button>
        </div>
      </div>

      {/* Reserve less than job-catalog's 380px: Person Information has no tabs row above the list. */}
      <div className="max-h-[calc(100svh-300px)] overflow-y-auto pr-1">
        {/* Column header lives inside the scroll box (same width context as the rows → aligned)
            and sticks to the top so it stays visible while the list scrolls. */}
        <div className={`${GRID} sticky top-0 z-10 bg-white px-3 pb-2 pt-1 text-sm font-medium text-foreground`}>
          <div>Name</div>
          <div>Type</div>
          <div>Required</div>
          <div>Added on</div>
          <div/>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={() => {
            setLocalGroups(normalize(propGroups));
            endDrag();
          }}
          autoScroll
        >
          <div className="space-y-4 pt-2">
            {display.length > 0 && (
              <SortableContext
                items={display.map((g) => g.id)}
                strategy={verticalListSortingStrategy}
              >
                <Accordion type="multiple" value={openIds} onValueChange={setOpenIds} className="w-full space-y-4">
                  {display.map((group) => (
                    <SortableGroup
                      key={group.id}
                      group={group}
                      dndEnabled={dndEnabled}
                      expandedAttrId={expandedAttrId}
                      onToggleAttr={toggleAttr}
                      onRenameGroup={onRenameGroup}
                      onDeleteGroup={onDeleteGroup}
                      onCreateAttribute={onCreateAttribute}
                      onDeleteAttribute={onDeleteAttribute}
                      onSaveAttribute={onSaveAttribute}
                      isSavingAttribute={isSavingAttribute}
                      draftRef={draftRef}
                      setExpandedAttrId={setExpandedAttrId}
                    />
                  ))}
                </Accordion>
              </SortableContext>
            )}
          </div>

          <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.2, 0, 0, 1)" }}>
            {activeGroup ? (
              <div className="rounded-md bg-brown-50 px-3 py-2.5 text-sm font-semibold uppercase tracking-wide text-brown-700 shadow-lg">
                <span className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-brown-300"/>
                  {activeGroup.name}
                  <span className="normal-case tracking-normal text-brown-400">
                    ({activeGroup.attributes?.length ?? 0})
                  </span>
                </span>
              </div>
            ) : activeAttribute ? (
              <div className="flex items-center gap-2 rounded-md border border-brown-100 bg-white px-3 py-2 text-sm font-medium text-foreground shadow-lg">
                <GripVertical className="h-4 w-4 text-brown-300"/>
                {activeAttribute.name}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* UI-only for now — no backend export wiring yet. */}
      <ExportDataModal
        isOpen={isExportOpen}
        title="Export attributes"
        description="Export all sections and their attributes."
        includedText="Includes every section with its attributes, types, and validation settings."
        onCancelAction={() => setIsExportOpen(false)}
        onConfirmAction={() => setIsExportOpen(false)}
      />
    </div>
  );
};

// --- Sortable group (brown bar + its attribute rows) -----------------------

type SortableGroupProps = {
  group: AttributeGroup;
  dndEnabled: boolean;
  expandedAttrId: string;
  onToggleAttr: (id: string) => void;
  onRenameGroup: (group: AttributeGroup) => void;
  onDeleteGroup: (group: AttributeGroup) => void;
  onCreateAttribute: (group: AttributeGroup) => void;
  onDeleteAttribute: (attribute: Attribute) => void;
  onSaveAttribute: (id: string, patch: Partial<Attribute>) => void;
  isSavingAttribute?: boolean;
  draftRef: React.MutableRefObject<Partial<Attribute>>;
  setExpandedAttrId: (id: string) => void;
};

const SortableGroup: FC<SortableGroupProps> = ({
  group,
  dndEnabled,
  expandedAttrId,
  onToggleAttr,
  onRenameGroup,
  onDeleteGroup,
  onCreateAttribute,
  onDeleteAttribute,
  onSaveAttribute,
  isSavingAttribute,
  draftRef,
  setExpandedAttrId,
}) => {
  const attributes = group.attributes ?? [];

  const { setNodeRef, attributes: dragAttrs, listeners, transform, transition, isDragging } =
    useSortable({ id: group.id, disabled: !dndEnabled });
  const { setNodeRef: setDropRef } = useDroppable({ id: `${DROP_PREFIX}${group.id}` });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <AccordionItem ref={setNodeRef} style={style} value={group.id} className="border-b-0">
      <div className="relative">
        <AccordionTrigger className="rounded-md bg-brown-50 px-3 py-2.5 pr-20 text-sm font-semibold uppercase tracking-wide text-brown-700 hover:no-underline">
          <span className="flex items-center gap-2">
            <span
              {...(dndEnabled ? dragAttrs : {})}
              {...(dndEnabled ? listeners : {})}
              onClick={(e) => e.stopPropagation()}
              className={`inline-flex ${dndEnabled ? "cursor-grab" : "cursor-default"}`}
              aria-label="Drag to reorder section"
            >
              <GripVertical className="h-4 w-4 shrink-0 text-brown-300"/>
            </span>
            {group.name}
            <span className="normal-case tracking-normal text-brown-400">
              ({attributes.length})
            </span>
            {group.isSystem ? (
              <Badge variant="secondary" className="font-normal normal-case tracking-normal">
                Preset
              </Badge>
            ) : null}
          </span>
        </AccordionTrigger>

        {/* Group actions live outside the trigger (a button can't nest a button). */}
        <PermissionGate
          anyOf={[
            { resource: "PEOPLE.ATTRIBUTES", action: "EDIT" },
            { resource: "PEOPLE.ATTRIBUTES", action: "MANAGE" },
          ]}
        >
          <div className="absolute right-9 top-1/2 -translate-y-1/2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-brown-600 hover:bg-brown-100"
                  aria-label="Section actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Ellipsis className="h-4 w-4"/>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <PermissionGate resource="PEOPLE.ATTRIBUTES" action="EDIT">
                  <DropdownMenuItem onClick={() => onRenameGroup(group)}>
                    Rename section
                  </DropdownMenuItem>
                </PermissionGate>

                <PermissionGate resource="PEOPLE.ATTRIBUTES" action="MANAGE">
                  <DropdownMenuItem variant="destructive" onClick={() => onDeleteGroup(group)}>
                    Delete section
                  </DropdownMenuItem>
                </PermissionGate>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </PermissionGate>
      </div>

      <AccordionContent>
        <div ref={setDropRef} className="pb-2">
          <SortableContext
            items={attributes.map((a) => a.id)}
            strategy={verticalListSortingStrategy}
          >
            {attributes.map((attr, index) => (
              <SortableAttributeRow
                key={attr.id}
                attribute={attr}
                notLast={index < attributes.length - 1}
                dndEnabled={dndEnabled}
                expanded={attr.id === expandedAttrId}
                onToggle={() => onToggleAttr(attr.id)}
                onDeleteAttribute={onDeleteAttribute}
                onSaveAttribute={onSaveAttribute}
                isSavingAttribute={isSavingAttribute}
                draftRef={draftRef}
                setExpandedAttrId={setExpandedAttrId}
              />
            ))}
          </SortableContext>

          {/* Add-attribute affordance as a dashed trailing row. */}
          <PermissionGate resource="PEOPLE.ATTRIBUTES" action="EDIT">
            <button
              type="button"
              className="mt-2 flex w-full items-center gap-1.5 rounded-md border border-dashed border-brown-300 px-3 py-2 text-sm text-brown-600 hover:bg-brown-50"
              onClick={() => onCreateAttribute(group)}
            >
              <Plus className="h-4 w-4"/>
              Add Attribute
            </button>
          </PermissionGate>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

// --- Sortable attribute row ------------------------------------------------

type SortableAttributeRowProps = {
  attribute: Attribute;
  notLast: boolean;
  dndEnabled: boolean;
  expanded: boolean;
  onToggle: () => void;
  onDeleteAttribute: (attribute: Attribute) => void;
  onSaveAttribute: (id: string, patch: Partial<Attribute>) => void;
  isSavingAttribute?: boolean;
  draftRef: React.MutableRefObject<Partial<Attribute>>;
  setExpandedAttrId: (id: string) => void;
};

const SortableAttributeRow: FC<SortableAttributeRowProps> = ({
  attribute,
  notLast,
  dndEnabled,
  expanded,
  onToggle,
  onDeleteAttribute,
  onSaveAttribute,
  isSavingAttribute,
  draftRef,
  setExpandedAttrId,
}) => {
  const isPreset = !!attribute.system;

  const { setNodeRef, attributes: dragAttrs, listeners, transform, transition, isDragging } =
    useSortable({ id: attribute.id, disabled: !dndEnabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={notLast ? "border-b border-brown-100" : ""}>
      <div
        className={`${GRID} px-3 py-2 cursor-pointer hover:bg-brown-50/50`}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            {...(dndEnabled ? dragAttrs : {})}
            {...(dndEnabled ? listeners : {})}
            onClick={(e) => e.stopPropagation()}
            className={`inline-flex ${dndEnabled ? "cursor-grab" : "cursor-default"}`}
            aria-label="Drag to reorder attribute"
          >
            <GripVertical className="h-4 w-4 shrink-0 text-brown-300"/>
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-brown-400"/>
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-brown-400"/>
          )}
          <span className="truncate text-sm font-medium text-foreground" title={attribute.name}>
            {attribute.name}
          </span>
        </div>

        <div className="text-sm text-muted-foreground">
          {getAttributeTypeLabel(attribute.type)}
        </div>

        <div className="text-sm text-muted-foreground">
          {attribute.required ? "Yes" : "—"}
        </div>

        <div className="text-sm text-muted-foreground">
          {formatDate(attribute.createdAt)}
        </div>

        <div className="flex items-center justify-end">
          {isPreset ? (
            <Badge variant="secondary" className="font-normal">
              Preset
            </Badge>
          ) : (
            <PermissionGate resource="PEOPLE.ATTRIBUTES" action="MANAGE">
              <button
                type="button"
                className="rounded-md p-1.5 text-brown-500 hover:bg-brown-50 hover:text-red-600"
                aria-label="Delete attribute"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteAttribute(attribute);
                }}
                disabled={isSavingAttribute}
              >
                <Trash2 className="h-4 w-4"/>
              </button>
            </PermissionGate>
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3" onClick={(e) => e.stopPropagation()}>
          <AttributeOptions
            attribute={attribute}
            isPreset={isPreset}
            onChange={(patch) => {
              draftRef.current = { ...draftRef.current, ...patch };
            }}
            onSave={() => {
              onSaveAttribute(attribute.id, draftRef.current);
              draftRef.current = {};
              setExpandedAttrId("");
            }}
            onCancel={() => {
              draftRef.current = {};
              setExpandedAttrId("");
            }}
          />
        </div>
      )}
    </div>
  );
};
