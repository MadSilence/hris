"use client";

import { FC, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronsDownUp,
  ChevronsUpDown,
  Download,
  Ellipsis,
  GripVertical,
  Lock,
  Pencil,
  Plus,
  Search,
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
import { AttributeType } from "@/models/attribute";
import { sortBySortOrder } from "@/components/modules/settings/modules/attributes/hooks/utils/useReorderAction";
import { getAttributeTypeLabel } from "@/components/modules/settings/modules/attributes/utils/attributeTypeUtils";
import { AttributeTypeChip } from "@/components/modules/settings/modules/attributes/components/AttributeTypeChip/AttributeTypeChip";
import { ExportDataModal } from "@/components/modules/settings/shared/ExportDataModal/ExportDataModal";
import {
  ExportDataFormValues,
  triggerExportDownload,
} from "@/components/modules/settings/shared/ExportDataModal";

type AttributeGroupsComponentProps = {
  groups: AttributeGroup[] | null | undefined;
  onCreateGroup: () => void;
  onRenameGroup: (group: AttributeGroup) => void;
  onDeleteGroup: (group: AttributeGroup) => void;
  onCreateAttribute: (group: AttributeGroup) => void;
  onEditAttribute: (attribute: Attribute) => void;
  onDeleteAttribute: (attribute: Attribute) => void;
  isSavingAttribute?: boolean;
  /** A section to reveal after creation — it is appended at the very end of a long list. */
  focusGroupId?: string | null;
  onFocusGroupHandled?: () => void;
  onReorderGroups: (orderedIds: string[]) => void;
  onReorderAttributes: (groupId: string, orderedIds: string[]) => void;
  onMoveAttribute: (attributeId: string, targetGroupId: string, targetOrderedIds: string[]) => void;
};

const GRID =
  "grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_48px] items-center gap-4";

const DROP_PREFIX = "dropzone:";

/** Compact summary of the most important type-specific settings, shown in the Details column. */
function attributeDetails(a: Attribute): string {
  const x = a as unknown as Record<string, unknown>;
  const parts: string[] = [];

  const range = (min: unknown, max: unknown, fmt: (v: unknown) => string): string | null => {
    const hasMin = min !== null && min !== undefined && min !== "";
    const hasMax = max !== null && max !== undefined && max !== "";
    if (hasMin && hasMax) return `${fmt(min)} – ${fmt(max)}`;
    if (hasMin) return `≥ ${fmt(min)}`;
    if (hasMax) return `≤ ${fmt(max)}`;
    return null;
  };
  const asIs = (v: unknown) => String(v);
  const asYear = (v: unknown) => {
    const d = new Date(String(v));
    return Number.isNaN(d.getTime()) ? String(v) : String(d.getFullYear());
  };
  const optionCount = () => (Array.isArray(x.options) ? x.options.length : 0);

  switch (a.type) {
    case AttributeType.NUMBER: {
      const r = range(x.minValue, x.maxValue, asIs);
      if (r) parts.push(r);
      if (x.onlyPositive) parts.push("positive");
      if (x.decScale === 0) parts.push("integer");
      else if (typeof x.decScale === "number" && x.decScale > 0) parts.push(`${x.decScale} dp`);
      break;
    }
    case AttributeType.TEXT:
    case AttributeType.EMAIL:
    case AttributeType.URL: {
      if (x.unique) parts.push("Unique");
      const r = range(x.minLength, x.maxLength, asIs);
      if (r) parts.push(`${r} chars`);
      if (x.regex) parts.push("pattern");
      break;
    }
    case AttributeType.LONG_TEXT: {
      const r = range(x.minLength, x.maxLength, asIs);
      if (r) parts.push(`${r} chars`);
      break;
    }
    case AttributeType.PHONE: {
      if (x.unique) parts.push("Unique");
      break;
    }
    case AttributeType.COUNTRY:
      parts.push("Country list");
      break;
    case AttributeType.LANGUAGE:
      parts.push("Language list");
      break;
    case AttributeType.TIMEZONE:
      parts.push("Timezone list");
      break;
    case AttributeType.CURRENCY:
      parts.push("Currency list");
      break;
    case AttributeType.OBJECT: {
      let count = 0;
      try {
        const arr = JSON.parse(String(x.objectFields ?? "[]"));
        count = Array.isArray(arr) ? arr.length : 0;
      } catch {
        count = 0;
      }
      parts.push(`${count} field${count === 1 ? "" : "s"}`);
      break;
    }
    case AttributeType.ADDRESS:
      parts.push("Address");
      break;
    case AttributeType.MONEY:
      parts.push("Amount + currency");
      break;
    case AttributeType.DATE: {
      const r = range(x.minDate, x.maxDate, asYear);
      if (r) parts.push(r);
      if (x.dateHideYear) parts.push("hide year");
      break;
    }
    case AttributeType.SELECT: {
      const n = optionCount();
      parts.push(`${n} option${n === 1 ? "" : "s"}`);
      break;
    }
    case AttributeType.MULTI_SELECT: {
      const n = optionCount();
      parts.push(`${n} option${n === 1 ? "" : "s"}`);
      const sel = range(x.minSelect, x.maxSelect, asIs);
      if (sel) parts.push(`${sel} selected`);
      break;
    }
    default:
      break;
  }

  return parts.join(" · ") || "—";
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
  onEditAttribute,
  onDeleteAttribute,
  isSavingAttribute,
  focusGroupId,
  onFocusGroupHandled,
  onReorderGroups,
  onReorderAttributes,
  onMoveAttribute,
}) => {
  const propGroups = groups ?? [];

  const [query, setQuery] = useState("");
  const [openIds, setOpenIds] = useState<string[]>(() => propGroups.map((g) => g.id));
  // Only one section can be in edit mode at a time — two open toolbars made it unclear which
  // section an action belonged to.
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async ({ format }: ExportDataFormValues) => {
    try {
      await triggerExportDownload("/api/attributes/export", format);
      setExportError(null);
      setIsExportOpen(false);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Export failed");
    }
  };

  // Per-group edit mode: reveals the per-attribute actions menu + add-attribute affordance.
  // Entering it on one section leaves any other.
  const toggleGroupEditing = (id: string) =>
    setEditingGroupId((cur) => (cur === id ? null : id));

  const [localGroups, setLocalGroups] = useState<AttributeGroup[]>(() => normalize(propGroups));
  const [activeId, setActiveId] = useState<string | null>(null);
  const draggingRef = useRef(false);
  const dragSourceGroupRef = useRef<string | null>(null);

  useEffect(() => {
    if (draggingRef.current) return;
    setLocalGroups(normalize(groups ?? []));
  }, [groups]);

  // A newly created section lands at the end of the list, off-screen. Open it, put it in edit mode
  // (that's what you want next — adding attributes) and scroll it into view.
  useEffect(() => {
    if (!focusGroupId) return;
    if (!localGroups.some((g) => g.id === focusGroupId)) return;

    setOpenIds((cur) => (cur.includes(focusGroupId) ? cur : [...cur, focusGroupId]));
    setEditingGroupId(focusGroupId);

    const el = document.querySelector(`[data-group-id="${focusGroupId}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });

    onFocusGroupHandled?.();
  }, [focusGroupId, localGroups, onFocusGroupHandled]);

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
      <div className="-mx-1 max-h-[calc(100svh-300px)] overflow-y-auto px-1">
        {/* Column header lives inside the scroll box (same width context as the rows → aligned)
            and sticks to the top so it stays visible while the list scrolls. */}
        <div className={`${GRID} sticky top-0 z-10 bg-white px-3 pb-2 pt-1 text-sm font-medium text-foreground`}>
          <div>Name</div>
          <div>Type</div>
          <div>Details</div>
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
                      editing={editingGroupId === group.id}
                      onToggleEditing={() => toggleGroupEditing(group.id)}
                      onRenameGroup={onRenameGroup}
                      onDeleteGroup={onDeleteGroup}
                      onCreateAttribute={onCreateAttribute}
                      onEditAttribute={onEditAttribute}
                      onDeleteAttribute={onDeleteAttribute}
                      isSavingAttribute={isSavingAttribute}
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

      <ExportDataModal
        isOpen={isExportOpen}
        title="Export attributes"
        description="Export all sections and their attributes."
        includedText="Includes every section with its attributes, types, validation settings, and option sets."
        errorMessage={exportError}
        onCancelAction={() => {
          setExportError(null);
          setIsExportOpen(false);
        }}
        onConfirmAction={handleExport}
      />
    </div>
  );
};

// --- Sortable group (brown bar + its attribute rows) -----------------------

type SortableGroupProps = {
  group: AttributeGroup;
  dndEnabled: boolean;
  editing: boolean;
  onToggleEditing: () => void;
  onRenameGroup: (group: AttributeGroup) => void;
  onDeleteGroup: (group: AttributeGroup) => void;
  onCreateAttribute: (group: AttributeGroup) => void;
  onEditAttribute: (attribute: Attribute) => void;
  onDeleteAttribute: (attribute: Attribute) => void;
  isSavingAttribute?: boolean;
};

const SortableGroup: FC<SortableGroupProps> = ({
  group,
  dndEnabled,
  editing,
  onToggleEditing,
  onRenameGroup,
  onDeleteGroup,
  onCreateAttribute,
  onEditAttribute,
  onDeleteAttribute,
  isSavingAttribute,
}) => {
  const attributes = group.attributes ?? [];

  const handleCreateAttribute = () => onCreateAttribute(group);
  const handleEditAttribute = (attribute: Attribute) => onEditAttribute(attribute);
  const handleDeleteAttribute = (attribute: Attribute) => onDeleteAttribute(attribute);

  const { setNodeRef, attributes: dragAttrs, listeners, transform, transition, isDragging } =
    useSortable({ id: group.id, disabled: !dndEnabled });
  const { setNodeRef: setDropRef } = useDroppable({ id: `${DROP_PREFIX}${group.id}` });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <AccordionItem
      ref={setNodeRef}
      style={style}
      value={group.id}
      data-group-id={group.id}
      className="border-b-0"
    >
      <div className="relative">
        <AccordionTrigger className="rounded-md bg-brown-50 px-3 py-2.5 pr-9 text-sm font-semibold uppercase tracking-wide text-brown-700 hover:no-underline">
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
                System
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
          <div className="absolute right-[54px] top-1/2 flex -translate-y-1/2 items-center">
            {editing ? (
              <>
              {/* Section rename/delete live behind the edit affordance now. Preset sections ship with
                  the product, so the menu is disabled rather than failing on save. */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={group.isSystem}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-brown-600 hover:bg-brown-100 disabled:opacity-40"
                    aria-label="Section actions"
                    disabled={group.isSystem}
                    title={group.isSystem ? "System sections can't be renamed or deleted" : undefined}
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

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-brown-600 hover:bg-brown-100"
                aria-label="Done editing section"
                title="Done"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleEditing();
                }}
              >
                <Check className="h-4 w-4"/>
              </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-brown-600 hover:bg-brown-100"
                aria-label="Edit section"
                title="Edit section"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleEditing();
                }}
              >
                <Pencil className="h-4 w-4"/>
              </Button>
            )}
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
                editing={editing}
                onEditAttribute={handleEditAttribute}
                onDeleteAttribute={handleDeleteAttribute}
                isSavingAttribute={isSavingAttribute}
              />
            ))}
          </SortableContext>

          {/* Add-attribute affordance (edit mode only) as a dashed trailing row. */}
          {editing && (
            <>
              <PermissionGate resource="PEOPLE.ATTRIBUTES" action="EDIT">
                <button
                  type="button"
                  className="mt-2 flex w-full items-center gap-1.5 rounded-md border border-dashed border-brown-300 px-3 py-2 text-sm text-brown-600 hover:bg-brown-50"
                  onClick={handleCreateAttribute}
                >
                  <Plus className="h-4 w-4"/>
                  Add Attribute
                </button>
              </PermissionGate>

            </>
          )}
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
  editing: boolean;
  onEditAttribute: (attribute: Attribute) => void;
  onDeleteAttribute: (attribute: Attribute) => void;
  isSavingAttribute?: boolean;
};

const SortableAttributeRow: FC<SortableAttributeRowProps> = ({
  attribute,
  notLast,
  dndEnabled,
  editing,
  onEditAttribute,
  onDeleteAttribute,
  isSavingAttribute,
}) => {
  const isPreset = !!attribute.system;
  const details = attributeDetails(attribute);

  const { setNodeRef, attributes: dragAttrs, listeners, transform, transition, isDragging } =
    useSortable({ id: attribute.id, disabled: !dndEnabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={notLast ? "border-b border-brown-100" : ""}>
      <div className={`${GRID} min-h-11 px-3 py-1.5`}>
        <div className="flex min-w-0 items-center gap-2">
          <span
            {...(dndEnabled ? dragAttrs : {})}
            {...(dndEnabled ? listeners : {})}
            className={`inline-flex ${dndEnabled ? "cursor-grab" : "cursor-default"}`}
            aria-label="Drag to reorder attribute"
          >
            <GripVertical className="h-4 w-4 shrink-0 text-brown-300"/>
          </span>
          <span className="truncate text-sm font-medium text-foreground" title={attribute.name}>
            {attribute.name}
          </span>
          {attribute.required && (
            <span className="shrink-0 text-red-500" title="Required" aria-label="Required">
              *
            </span>
          )}
          {isPreset && (
            <Badge variant="secondary" className="shrink-0 font-normal">
              System
            </Badge>
          )}
          {attribute.sensitive && (
            <Badge
              variant="outline"
              className="shrink-0 gap-1 border-amber-300 bg-amber-50 font-normal text-amber-700"
              title="Access isn't granted automatically; people without it see a placeholder"
            >
              <Lock className="h-3 w-3" />
              Sensitive
            </Badge>
          )}
        </div>

        <div className="min-w-0">
          <AttributeTypeChip type={attribute.type} />
        </div>

        <div className="truncate text-sm text-muted-foreground" title={details}>
          {details}
        </div>

        <div className="flex items-center justify-end">
          {editing && (
            <PermissionGate
              anyOf={[
                { resource: "PEOPLE.ATTRIBUTES", action: "EDIT" },
                { resource: "PEOPLE.ATTRIBUTES", action: "MANAGE" },
              ]}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-brown-500 hover:bg-brown-100"
                    aria-label="Attribute actions"
                    title={isPreset ? "System attributes can't be edited" : undefined}
                    disabled={isPreset || isSavingAttribute}
                  >
                    <Ellipsis className="h-4 w-4"/>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <PermissionGate resource="PEOPLE.ATTRIBUTES" action="EDIT">
                    <DropdownMenuItem onClick={() => onEditAttribute(attribute)}>
                      Edit
                    </DropdownMenuItem>
                  </PermissionGate>

                  <PermissionGate resource="PEOPLE.ATTRIBUTES" action="MANAGE">
                    <DropdownMenuItem variant="destructive" onClick={() => onDeleteAttribute(attribute)}>
                      Delete
                    </DropdownMenuItem>
                  </PermissionGate>
                </DropdownMenuContent>
              </DropdownMenu>
            </PermissionGate>
          )}
        </div>
      </div>
    </div>
  );
};
