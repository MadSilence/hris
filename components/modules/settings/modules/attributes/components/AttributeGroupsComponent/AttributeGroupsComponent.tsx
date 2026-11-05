"use client";

import { FC, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Add01Icon, Copy01Icon, Delete02Icon, Download01Icon, DragDropVerticalIcon, PencilEdit02Icon, SquareLock02Icon, Tick02Icon, UnfoldLessIcon, UnfoldMoreIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
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

import { Button } from "@/components/desact/button";
import { Badge } from "@/components/desact/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/desact/accordion";
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AttributeGroup } from "@/models/attribute/AttributeGroup";
import { Attribute } from "@/models/attribute/Attribute";
import { AttributeType } from "@/models/attribute";
import { sortBySortOrder } from "@/components/modules/settings/modules/attributes/hooks/utils/useReorderAction";
import { attributeTypeLabelKey } from "@/components/modules/settings/modules/attributes/utils/attributeTypeUtils";
import { AttributeTypeChip } from "@/components/modules/settings/modules/attributes/components/AttributeTypeChip/AttributeTypeChip";
import { ExportDataModal } from "@/components/modules/settings/shared/ExportDataModal/ExportDataModal";
import { SearchBox } from "@/components/ui/SearchBox";
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
  onDuplicateAttribute: (attribute: Attribute) => void;
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
type DetailsTranslator = ReturnType<typeof useTranslations<"settings.attributes.details">>;

function attributeDetails(a: Attribute, t: DetailsTranslator): string {
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
      if (x.onlyPositive) parts.push(t("positive"));
      if (x.decScale === 0) parts.push(t("integer"));
      else if (typeof x.decScale === "number" && x.decScale > 0) parts.push(t("decimalPlaces", { count: x.decScale }));
      break;
    }
    case AttributeType.TEXT:
    case AttributeType.EMAIL:
    case AttributeType.URL: {
      if (x.isUnique) parts.push(t("unique"));
      const r = range(x.minLength, x.maxLength, asIs);
      if (r) parts.push(t("chars", { range: r }));
      if (x.regex) parts.push(t("pattern"));
      break;
    }
    case AttributeType.LONG_TEXT: {
      const r = range(x.minLength, x.maxLength, asIs);
      if (r) parts.push(t("chars", { range: r }));
      break;
    }
    case AttributeType.PHONE: {
      if (x.isUnique) parts.push(t("unique"));
      break;
    }
    case AttributeType.COUNTRY:
      parts.push(t("countryList"));
      break;
    case AttributeType.LANGUAGE:
      parts.push(t("languageList"));
      break;
    case AttributeType.TIMEZONE:
      parts.push(t("timezoneList"));
      break;
    case AttributeType.CURRENCY:
      parts.push(t("currencyList"));
      break;
    case AttributeType.OBJECT: {
      let count = 0;
      try {
        const arr = JSON.parse(String(x.objectFields ?? "[]"));
        count = Array.isArray(arr) ? arr.length : 0;
      } catch {
        count = 0;
      }
      parts.push(t("fields", { count }));
      break;
    }
    case AttributeType.ADDRESS:
      parts.push(t("address"));
      break;
    case AttributeType.MONEY:
      parts.push(t("amountCurrency"));
      break;
    case AttributeType.DATE: {
      const r = range(x.minDate, x.maxDate, asYear);
      if (r) parts.push(r);
      if (x.dateHideYear) parts.push(t("hideYear"));
      break;
    }
    case AttributeType.SELECT: {
      const n = optionCount();
      parts.push(t("options", { count: n }));
      break;
    }
    case AttributeType.MULTI_SELECT: {
      const n = optionCount();
      parts.push(t("options", { count: n }));
      const sel = range(x.minSelect, x.maxSelect, asIs);
      if (sel) parts.push(t("selected", { range: sel }));
      break;
    }
    default:
      break;
  }

  return parts.join(" · ");
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
  onDuplicateAttribute,
  onDeleteAttribute,
  isSavingAttribute,
  focusGroupId,
  onFocusGroupHandled,
  onReorderGroups,
  onReorderAttributes,
  onMoveAttribute,
}) => {
  const t = useTranslations("settings.attributes.list");
  const tSettings = useTranslations("settings");
  const tCommon = useTranslations("common");
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
      setExportError(error instanceof Error ? error.message : t("exportFailed"));
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
                tSettings(attributeTypeLabelKey(attr.type)).toLowerCase().includes(needle),
            );

        return { ...group, attributes };
      })
      .filter(
        (group) =>
          group.name.toLowerCase().includes(needle) ||
          (group.attributes?.length ?? 0) > 0,
      );
  }, [localGroups, needle, tSettings]);

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
        <SearchBox value={query} onChange={setQuery}/>

        <div className="flex items-center gap-2">
          <Button type="button"
            variant="ghost"
            className="gap-1.5 text-secondary"
            onClick={toggleAll}
            disabled={display.length === 0}
          >
            {allOpen ? <Icon icon={UnfoldLessIcon} size="sm" /> : <Icon icon={UnfoldMoreIcon} size="sm" />}
            {allOpen ? t("collapseAll") : t("expandAll")}
          </Button>

          {/* A section with its fields, ready-made (TEMPLATES_DESIGN.md § 4.3): the field sets of the catalogue. */}
          <PermissionGate resource="PEOPLE.ATTRIBUTES" action="EDIT">
            <Button asChild variant="secondary">
              <Link href="/settings/general/templates?kind=FIELD_SET" className="no-underline">
                {t("addFromLibrary")}
              </Link>
            </Button>
          </PermissionGate>

          <PermissionGate resource="PEOPLE.ATTRIBUTES" action="EDIT">
            <Button type="button" className="gap-1.5" onClick={onCreateGroup}>
              <Icon icon={Add01Icon} size="sm" />
              {t("addSection")}
            </Button>
          </PermissionGate>

          <Button type="button"
            size="icon"
            variant="secondary"
            onClick={() => setIsExportOpen(true)}
            aria-label={t("export")}
          >
            <Icon icon={Download01Icon} size="sm" />
          </Button>
        </div>
      </div>

      {/* Reserve less than job-catalog's 380px: Person Information has no tabs row above the list. */}
      <div className="-mx-1 max-h-[calc(100svh-300px)] overflow-y-auto px-1">
        {/* Column header lives inside the scroll box (same width context as the rows → aligned)
            and sticks to the top so it stays visible while the list scrolls. */}
        <div className={`${GRID} sticky top-0 z-10 bg-card px-3 pb-2 pt-1 text-body font-medium text-primary`}>
          <div>{tCommon("fields.name")}</div>
          <div>{tCommon("fields.type")}</div>
          <div>{t("details")}</div>
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
                      onDuplicateAttribute={onDuplicateAttribute}
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
              <div className="rounded-control bg-subtle px-3 py-2.5 text-body font-semibold text-secondary shadow-popover">
                <span className="flex items-center gap-2">
                  <Icon icon={DragDropVerticalIcon} size="sm" className="text-disabled" />
                  {activeGroup.name}
                  <span className="normal-case text-tertiary">
                    ({activeGroup.attributes?.length ?? 0})
                  </span>
                </span>
              </div>
            ) : activeAttribute ? (
              <div className="flex items-center gap-2 rounded-control border border-divider bg-card px-3 py-2 text-body font-medium text-primary shadow-popover">
                <Icon icon={DragDropVerticalIcon} size="sm" className="text-disabled" />
                {activeAttribute.name}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <ExportDataModal
        isOpen={isExportOpen}
        title={t("export")}
        description={t("exportDescription")}
        includedText={t("exportIncluded")}
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

// --- Sortable group (its header bar + its attribute rows) ------------------

type SortableGroupProps = {
  group: AttributeGroup;
  dndEnabled: boolean;
  editing: boolean;
  onToggleEditing: () => void;
  onRenameGroup: (group: AttributeGroup) => void;
  onDeleteGroup: (group: AttributeGroup) => void;
  onCreateAttribute: (group: AttributeGroup) => void;
  onEditAttribute: (attribute: Attribute) => void;
  onDuplicateAttribute: (attribute: Attribute) => void;
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
  onDuplicateAttribute,
  onDeleteAttribute,
  isSavingAttribute,
}) => {
  const t = useTranslations("settings.attributes.list");
  const tCommon = useTranslations("common");
  const attributes = group.attributes ?? [];
  const description = group.description?.trim();

  const handleCreateAttribute = () => onCreateAttribute(group);
  const handleEditAttribute = (attribute: Attribute) => onEditAttribute(attribute);
  const handleDuplicateAttribute = (attribute: Attribute) => onDuplicateAttribute(attribute);
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
        <AccordionTrigger className="rounded-control bg-subtle px-3 py-2.5 pr-9 text-body font-semibold text-secondary hover:no-underline">
          <span className="flex items-center gap-2">
            <span
              {...(dndEnabled ? dragAttrs : {})}
              {...(dndEnabled ? listeners : {})}
              onClick={(e) => e.stopPropagation()}
              className={`inline-flex ${dndEnabled ? "cursor-grab" : "cursor-default"}`}
              aria-label={t("dragSection")}
            >
              <Icon icon={DragDropVerticalIcon} size="sm" className="shrink-0 text-disabled" />
            </span>
            {group.name}
            <span className="normal-case text-tertiary">
              ({attributes.length})
            </span>
            {group.isSystem ? (
              <Badge variant="neutral" className="font-normal normal-case">
                {t("system")}
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
              <RowActionsMenu
                label={t("sectionActions")}
                disabled={group.isSystem}
                title={group.isSystem ? t("systemSectionLocked") : undefined}
                stopPropagation
              >
                <PermissionGate resource="PEOPLE.ATTRIBUTES" action="EDIT">
                  {/* Opens the section's name-and-description form, so it is Edit, not Rename. */}
                  <RowAction
                    icon={<Icon icon={PencilEdit02Icon} size="sm" />}
                    onClick={() => onRenameGroup(group)}
                  >
                    {tCommon("actions.edit")}
                  </RowAction>
                </PermissionGate>

                <PermissionGate resource="PEOPLE.ATTRIBUTES" action="MANAGE">
                  <RowActionDestructive
                    icon={<Icon icon={Delete02Icon} size="sm" />}
                    onClick={() => onDeleteGroup(group)}
                  >
                    {tCommon("actions.delete")}
                  </RowActionDestructive>
                </PermissionGate>
              </RowActionsMenu>

              <Button type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-secondary hover:bg-mist"
                aria-label={t("doneEditingSection")}
                title={tCommon("actions.done")}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleEditing();
                }}
              >
                <Icon icon={Tick02Icon} size="sm" />
              </Button>
              </>
            ) : (
              <Button type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-secondary hover:bg-mist"
                aria-label={t("editSection")}
                title={t("editSection")}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleEditing();
                }}
              >
                <Icon icon={PencilEdit02Icon} size="sm" />
              </Button>
            )}
          </div>
        </PermissionGate>
      </div>

      <AccordionContent>
        <div ref={setDropRef} className="pb-2">
          {description && (
            <p className="whitespace-pre-line px-3 pb-2 pt-1 text-body text-tertiary">
              {description}
            </p>
          )}

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
                onDuplicateAttribute={handleDuplicateAttribute}
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
                  className="mt-2 flex w-full items-center gap-1.5 rounded-control border border-dashed border-field px-3 py-2 text-body text-secondary hover:bg-subtle"
                  onClick={handleCreateAttribute}
                >
                  <Icon icon={Add01Icon} size="sm" />
                  {t("addAttribute")}
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
  onDuplicateAttribute: (attribute: Attribute) => void;
  onDeleteAttribute: (attribute: Attribute) => void;
  isSavingAttribute?: boolean;
};

const SortableAttributeRow: FC<SortableAttributeRowProps> = ({
  attribute,
  notLast,
  dndEnabled,
  editing,
  onEditAttribute,
  onDuplicateAttribute,
  onDeleteAttribute,
  isSavingAttribute,
}) => {
  const t = useTranslations("settings.attributes.list");
  const tDetails = useTranslations("settings.attributes.details");
  const tCommon = useTranslations("common");
  const isPreset = !!attribute.isSystem;
  const details = attributeDetails(attribute, tDetails);

  const { setNodeRef, attributes: dragAttrs, listeners, transform, transition, isDragging } =
    useSortable({ id: attribute.id, disabled: !dndEnabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={notLast ? "border-b border-divider" : ""}>
      <div className={`${GRID} min-h-11 px-3 py-1.5`}>
        <div className="flex min-w-0 items-center gap-2">
          <span
            {...(dndEnabled ? dragAttrs : {})}
            {...(dndEnabled ? listeners : {})}
            className={`inline-flex ${dndEnabled ? "cursor-grab" : "cursor-default"}`}
            aria-label={t("dragAttribute")}
          >
            <Icon icon={DragDropVerticalIcon} size="sm" className="shrink-0 text-disabled" />
          </span>
          <span className="truncate text-body font-medium text-primary" title={attribute.name}>
            {attribute.name}
          </span>
          {attribute.required && (
            <span className="shrink-0 text-danger-text" title={tCommon("fields.required")} aria-label={tCommon("fields.required")}>
              *
            </span>
          )}
          {isPreset && (
            <Badge variant="neutral" className="shrink-0 font-normal">
              {t("system")}
            </Badge>
          )}
          {attribute.sensitive && (
            <Badge
              variant="neutral"
              className="shrink-0"
              title={t("sensitiveTitle")}
            >
              <Icon icon={SquareLock02Icon} size="sm" />
              {t("sensitive")}
            </Badge>
          )}
        </div>

        <div className="min-w-0">
          <AttributeTypeChip type={attribute.type} />
        </div>

        <div className="truncate text-body text-tertiary" title={details}>
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
              <RowActionsMenu
                label={t("attributeActions")}
                disabled={isPreset || isSavingAttribute}
                title={isPreset ? t("systemAttributeLocked") : undefined}
              >
                <PermissionGate resource="PEOPLE.ATTRIBUTES" action="EDIT">
                  <RowAction
                    icon={<Icon icon={PencilEdit02Icon} size="sm" />}
                    onClick={() => onEditAttribute(attribute)}
                  >
                    {tCommon("actions.edit")}
                  </RowAction>

                  <RowAction
                    icon={<Icon icon={Copy01Icon} size="sm" />}
                    onClick={() => onDuplicateAttribute(attribute)}
                  >
                    {tCommon("actions.duplicate")}
                  </RowAction>
                </PermissionGate>

                <PermissionGate resource="PEOPLE.ATTRIBUTES" action="MANAGE">
                  <RowActionDestructive
                    icon={<Icon icon={Delete02Icon} size="sm" />}
                    onClick={() => onDeleteAttribute(attribute)}
                  >
                    {tCommon("actions.delete")}
                  </RowActionDestructive>
                </PermissionGate>
              </RowActionsMenu>
            </PermissionGate>
          )}
        </div>
      </div>
    </div>
  );
};
