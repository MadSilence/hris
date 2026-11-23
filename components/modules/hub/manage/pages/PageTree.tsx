"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  Copy01Icon,
  Delete02Icon,
  DragDropVerticalIcon,
  PencilEdit02Icon,
  UnavailableIcon,
  UserGroupIcon,
  ArrowTurnBackwardIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/desact/tooltip";
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import type { TreePage, TreeSection } from "@/models/hub";
import { cn } from "@/lib/cn";
import { firstNameOf, hubIcon, IconTile, PersonAvatar, ProgressBar, TruncatedTitle, useHubDates } from "../../shared";
import { dropDragId, movePage, moveSection, pageDragId, parseDragId, sectionDragId, type PageMove, type SectionMove } from "./treeOps";

/*
 * CM03's rows (FIXES J1–J10): padding 0 8, 8 between the parts — the page column takes what is left, then Owner 160,
 * Must read 200 (its bar 176, 24 to the right), Updated 80 (right-aligned) and the actions 72. A section row is the
 * chevron, its 24 tile and its name; a page row starts its icon at 62 and its title at 86. Hairlines only under a
 * section's group. A hovered row is #F7F7F8 at radius 10, with the drag handle 4 from its left.
 */
const ROW = "group relative flex h-11 items-center gap-2 rounded-popover px-2 hover:bg-subtle";
const OWNER = "flex w-40 shrink-0 items-center gap-2";
const MUST_READ = "flex w-[200px] shrink-0 flex-col gap-1 pr-6";
const UPDATED = "w-20 shrink-0 text-right";
const ACTIONS = "flex w-[72px] shrink-0 items-center justify-end";

export type PageTreeHandlers = {
  onSectionMove: (move: SectionMove) => void;
  onPageMove: (move: PageMove) => void;
  onAddPage: (sectionId: string) => void;
  onRenameSection: (section: TreeSection, name: string) => void;
  onSectionAppearance: (section: TreeSection) => void;
  onSectionAudience: (section: TreeSection) => void;
  onDeleteSection: (section: TreeSection) => void;
  /** Absent with a single section: there is nowhere to move a page, so "Move to…" is not offered (NEVER-DISABLED). */
  onMovePageTo?: (page: TreePage) => void;
  onDuplicatePage: (page: TreePage) => void;
  onUnpublishPage: (page: TreePage) => void;
  onDeletePage: (page: TreePage) => void;
  /** Sections — their menu, their order, deleting a page — are MANAGE (design § 5.1). */
  canManage: boolean;
};

/** Where a dragged row will land right now: above or below this row. */
type Landing = "before" | "after" | null;

type SortableBits = Pick<ReturnType<typeof useSortable>, "setNodeRef" | "attributes" | "listeners" | "isDragging">;

/** The landing place: a 2 px solid accent line, at the row's top or its bottom (FIXES J13). */
const LandingLine: React.FC<{ at: Landing }> = ({ at }) =>
  at ? <span aria-hidden className={cn("pointer-events-none absolute right-0 left-0 z-10 h-0.5 rounded-pill bg-accent", at === "before" ? "-top-px" : "-bottom-px")} /> : null;

/** The drag handle: 14 × 16 #9C9CA3, 4 from the row's left, on hover only (J3, J9). */
const DragHandle: React.FC<{ sortable?: SortableBits; label: string }> = ({ sortable, label }) =>
  sortable ? (
    <button
      type="button"
      aria-label={label}
      className="absolute top-1/2 left-1 flex h-4 w-3.5 -translate-y-1/2 cursor-grab items-center justify-center text-disabled opacity-0 group-hover:opacity-100 touch:opacity-100 focus-visible:opacity-100"
      {...sortable.attributes}
      {...sortable.listeners}
    >
      <Icon icon={DragDropVerticalIcon} size="sm" className="size-3.5" />
    </button>
  ) : null;

/** A page row that drags (`useSortable`); the overlay draws the same row without it. Rows never shift while dragging. */
const SortablePageRow: React.FC<{ page: TreePage; handlers: PageTreeHandlers; landing: Landing }> = ({ page, handlers, landing }) => {
  const sortable = useSortable({ id: pageDragId(page.id) });
  return <PageRow page={page} handlers={handlers} sortable={sortable} landing={landing} />;
};

const PageRow: React.FC<{ page: TreePage; handlers: PageTreeHandlers; sortable?: SortableBits; landing?: Landing }> = ({
  page,
  handlers,
  sortable,
  landing = null,
}) => {
  const t = useTranslations("hub");
  const router = useRouter();
  const dates = useHubDates();
  const overlay = !sortable;
  return (
    <div
      ref={sortable?.setNodeRef}
      className={cn(ROW, sortable?.isDragging && "opacity-40", overlay && "bg-card shadow-drag hover:bg-card")}
    >
      <LandingLine at={landing} />
      <DragHandle sortable={sortable} label={t("manage.pages.dragToMove")} />
      {/* 16 + 22 of room, so the icon sits at 62 and the title at 86 (J6). */}
      <span aria-hidden className="w-4 shrink-0" />
      <span aria-hidden className="w-[22px] shrink-0" />
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <Icon icon={hubIcon(page.icon)} size="sm" className="shrink-0 text-tertiary" />
        <Link href={`/hub/manage/pages/${page.id}/edit`} className="flex min-w-0 text-body text-primary no-underline hover:underline">
          <TruncatedTitle title={page.title || t("manage.untitled")} />
        </Link>
        {page.status !== "PUBLISHED" && <span className="shrink-0 text-hint text-tertiary">{t(`manage.pageStatus.${page.status}`)}</span>}
      </span>
      <span className={cn(OWNER, "text-body text-secondary")}>
        {page.owner && (
          <>
            <PersonAvatar person={page.owner} />
            <span className="truncate">{firstNameOf(page.owner.name)}</span>
          </>
        )}
      </span>
      <span className={MUST_READ}>
        {page.mustRead ? (
          <>
            <span className="text-hint text-tertiary tabular-nums">{t("manage.agreedOf", { agreed: page.agreed, needed: page.needed })}</span>
            <ProgressBar value={page.agreed} max={page.needed} className="w-44" />
          </>
        ) : (
          <span className="text-hint text-tertiary">—</span>
        )}
      </span>
      <span className={cn(UPDATED, "text-hint text-tertiary tabular-nums")}>{dates.short(page.updatedAt)}</span>
      <span className={cn(ACTIONS, "[&_button>svg]:size-5")}>
        {!overlay && (
          <RowActionsMenu label={t("manage.pageMenu", { title: page.title })}>
            <RowAction icon={<Icon icon={PencilEdit02Icon} size="sm" />} onClick={() => router.push(`/hub/manage/pages/${page.id}/edit`)}>
              {t("manage.menu.edit")}
            </RowAction>
            {page.mustRead && (
              <RowAction icon={<Icon icon={CheckmarkCircle02Icon} size="sm" />} onClick={() => router.push(`/hub/manage/pages/${page.id}/agreed`)}>
                {t("manage.menu.whoAgreed")}
              </RowAction>
            )}
            {handlers.onMovePageTo && (
              <RowAction icon={<Icon icon={ArrowTurnBackwardIcon} size="sm" />} onClick={() => handlers.onMovePageTo?.(page)}>
                {t("manage.menu.moveTo")}
              </RowAction>
            )}
            <RowAction icon={<Icon icon={Copy01Icon} size="sm" />} onClick={() => handlers.onDuplicatePage(page)}>
              {t("manage.menu.duplicate")}
            </RowAction>
            {page.status === "PUBLISHED" && (
              <RowAction icon={<Icon icon={UnavailableIcon} size="sm" />} onClick={() => handlers.onUnpublishPage(page)}>
                {t("manage.menu.unpublish")}
              </RowAction>
            )}
            {handlers.canManage && (
              <RowActionDestructive icon={<Icon icon={Delete02Icon} size="sm" />} onClick={() => handlers.onDeletePage(page)}>
                {t("manage.menu.delete")}
              </RowActionDestructive>
            )}
          </RowActionsMenu>
        )}
      </span>
    </div>
  );
};

const SectionName: React.FC<{ section: TreeSection; renaming: boolean; onRename: (name: string | null) => void }> = ({ section, renaming, onRename }) => {
  const t = useTranslations("hub");
  const [value, setValue] = React.useState(section.name);
  const field = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => setValue(section.name), [section.name, renaming]);
  // Focused after the render that closed the section menu: `autoFocus` fires while the menu still holds focus, and the
  // field then showed with nowhere for typing to go (walk of 2026-11-19).
  React.useEffect(() => {
    if (!renaming) return;
    const id = window.setTimeout(() => field.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [renaming]);
  if (!renaming) return <span className="min-w-0 flex-1 truncate text-body font-semibold text-primary">{section.name}</span>;
  return (
    <input
      ref={field}
      autoFocus
      aria-label={t("manage.pages.sectionName")}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onFocus={(e) => e.currentTarget.select()}
      onKeyDown={(e) => {
        if (e.key === "Enter") onRename(value.trim() || null);
        if (e.key === "Escape") onRename(null);
      }}
      onBlur={() => onRename(value.trim() || null)}
      className="h-7 min-w-0 flex-1 rounded-control border border-accent bg-card px-2 text-body font-semibold text-primary outline-none shadow-focus"
    />
  );
};

/** A section's row as it floats under the cursor while dragged. */
const SectionOverlayRow: React.FC<{ section: TreeSection }> = ({ section }) => {
  const t = useTranslations("hub");
  return (
    <div className={cn(ROW, "bg-card shadow-drag hover:bg-card")}>
      <Icon icon={ArrowRight01Icon} size="sm" className="shrink-0 text-tertiary" />
      <IconTile icon={hubIcon(section.icon)} color={section.color} size={24} />
      <span className="min-w-0 flex-1 truncate text-body font-semibold text-primary">{section.name}</span>
      <span className={cn(OWNER, "text-hint text-tertiary")}>{t("handbook.pages", { count: section.pages.length })}</span>
      <span className="w-[200px] shrink-0" />
      <span className="w-20 shrink-0" />
      <span className="w-[72px] shrink-0" />
    </div>
  );
};

const SectionBlock: React.FC<{
  section: TreeSection;
  handlers: PageTreeHandlers;
  expanded: boolean;
  onToggle: () => void;
  renaming: boolean;
  setRenaming: (id: string | null) => void;
  dragging: "page" | "section" | null;
  /** This section's landing line while a section is dragged; the page that a dragged page lands next to. */
  landing: Landing;
  pageLanding: { pageId: string; at: Landing } | null;
  joining: boolean;
}> = ({ section, handlers, expanded, onToggle, renaming, setRenaming, dragging, landing, pageLanding, joining }) => {
  const t = useTranslations("hub");
  const [all, setAll] = React.useState(false);
  const sortable = useSortable({ id: sectionDragId(section.id), disabled: !handlers.canManage });
  const drop = useDroppable({ id: dropDragId(section.id) });
  const pages = all ? section.pages : section.pages.slice(0, 3);
  // Rename from the menu: the menu must not take focus back to its kebab from the name's field.
  const renameRequested = React.useRef(false);

  return (
    // The hairline under the group: under a closed section's row, or under the last row of an open one (J2).
    <div ref={sortable.setNodeRef} className={cn("relative border-b border-divider", sortable.isDragging && "opacity-40")}>
      <LandingLine at={dragging === "section" ? landing : null} />
      <div ref={drop.setNodeRef} className={cn(ROW, joining && dragging === "page" && "bg-accent-subtle hover:bg-accent-subtle")}>
        {handlers.canManage && <DragHandle sortable={sortable} label={t("manage.pages.dragToMove")} />}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-label={section.name}
          className="flex size-4 shrink-0 items-center justify-center rounded-glyph text-tertiary"
        >
          <Icon icon={expanded ? ArrowDown01Icon : ArrowRight01Icon} size="sm" />
        </button>
        <IconTile icon={hubIcon(section.icon)} color={section.color} size={24} />
        <SectionName
          section={section}
          renaming={renaming}
          onRename={(name) => {
            setRenaming(null);
            if (name && name !== section.name) handlers.onRenameSection(section, name);
          }}
        />
        {/* "{n} pages" in the Owner column; "{n} must-read" tertiary (J3, J5). */}
        <span className={cn(OWNER, "text-hint text-tertiary")}>{t("handbook.pages", { count: section.pages.length })}</span>
        <span className={cn(MUST_READ, "text-hint text-tertiary")}>
          {section.mustReadCount > 0 ? t("manage.pages.mustReadCount", { count: section.mustReadCount }) : ""}
        </span>
        <span className={UPDATED} />
        {/* + and ⋯ both secondary, nothing between them, 32 each (J4). The section menu is MANAGE: not shown otherwise. */}
        <span className={ACTIONS}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-secondary"
                aria-label={t("manage.pages.addToSection")}
                onClick={() => handlers.onAddPage(section.id)}
              >
                <Icon icon={Add01Icon} size="sm" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("manage.pages.addToSection")}</TooltipContent>
          </Tooltip>
          {handlers.canManage && (
            <RowActionsMenu
              label={t("manage.pages.sectionOptions")}
              onCloseAutoFocus={(event) => {
                if (!renameRequested.current) return;
                renameRequested.current = false;
                event.preventDefault();
              }}
            >
              <RowAction
                icon={<Icon icon={PencilEdit02Icon} size="sm" />}
                onClick={() => {
                  renameRequested.current = true;
                  setRenaming(section.id);
                }}
              >
                {t("manage.menu.rename")}
              </RowAction>
              <RowAction icon={<Icon icon={hubIcon(section.icon)} size="sm" />} onClick={() => handlers.onSectionAppearance(section)}>
                {t("manage.menu.iconColour")}
              </RowAction>
              <RowAction icon={<Icon icon={UserGroupIcon} size="sm" />} onClick={() => handlers.onSectionAudience(section)}>
                {t("manage.menu.sectionAudience")}
              </RowAction>
              <RowActionDestructive icon={<Icon icon={Delete02Icon} size="sm" />} onClick={() => handlers.onDeleteSection(section)}>
                {t("manage.menu.deleteSection")}
              </RowActionDestructive>
            </RowActionsMenu>
          )}
        </span>
      </div>
      {expanded && (
        <SortableContext items={pages.map((p) => pageDragId(p.id))} strategy={verticalListSortingStrategy}>
          {pages.map((page) => (
            <SortablePageRow
              key={page.id}
              page={page}
              handlers={handlers}
              landing={pageLanding && pageLanding.pageId === page.id ? pageLanding.at : null}
            />
          ))}
          {/* "{n} more pages" 13/20 500 accent from 110; opened, "Show less" in the same place folds it back (J10). */}
          {section.pages.length > 3 && (
            <div className="flex h-11 items-center px-2">
              <button
                type="button"
                className="ml-[102px] text-hub-small font-medium text-accent hover:underline"
                onClick={() => setAll((open) => !open)}
              >
                {all ? t("handbook.showLess") : t("manage.pages.morePages", { count: section.pages.length - 3 })}
              </button>
            </div>
          )}
        </SortableContext>
      )}
    </div>
  );
};

/**
 * The target is read from the pointer, never from the dragged row's rectangle (J13): a dragged page lands next to the
 * page under the cursor, or at the end of the section whose row is under it; a dragged section takes the place of the
 * section under the cursor.
 */
export const treeCollision: CollisionDetection = (args) => {
  const kind = parseDragId(args.active.id)?.kind;
  const hits = pointerWithin(args);
  const of = (k: "page" | "drop" | "section") => hits.filter((h) => parseDragId(h.id)?.kind === k);
  if (kind === "section") {
    const sections = of("section").filter((h) => h.id !== args.active.id);
    if (sections.length) return sections;
    return closestCenter({ ...args, droppableContainers: args.droppableContainers.filter((c) => parseDragId(c.id)?.kind === "section") });
  }
  const pages = of("page").filter((h) => h.id !== args.active.id);
  if (pages.length) return pages;
  return of("drop");
};

/**
 * The handbook as a tree (`PageTree`, CM03): sections with their pages, drag and drop within a section, into another
 * one (a drop on a section's row adds the page at its end) and among sections. Moves are saved at once; the caller
 * owns the requests and the Undo. The floating copy is portalled to the body, so no scrolled or transformed parent
 * moves it off the cursor; it keeps the point where it was grabbed (J13).
 */
export const PageTree: React.FC<{
  sections: TreeSection[];
  handlers: PageTreeHandlers;
  renamingId: string | null;
  setRenamingId: (id: string | null) => void;
  /** Every section open — while searching. */
  expandAll?: boolean;
}> = ({ sections, handlers, renamingId, setRenamingId, expandAll = false }) => {
  const t = useTranslations("hub");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const [open, setOpen] = React.useState<Set<string>>(() => new Set(sections.filter((s) => s.mustReadCount > 0).map((s) => s.id)));
  const [active, setActive] = React.useState<{ kind: "page" | "section"; id: string } | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const onDragStart = (event: DragStartEvent) => {
    const parsed = parseDragId(event.active.id);
    if (parsed && parsed.kind !== "drop") setActive({ kind: parsed.kind, id: parsed.id });
  };
  const onDragOver = (event: DragOverEvent) => setOverId(typeof event.over?.id === "string" ? event.over.id : null);
  const reset = () => {
    setActive(null);
    setOverId(null);
  };

  const onDragEnd = (event: DragEndEvent) => {
    reset();
    const from = parseDragId(event.active.id);
    const to = parseDragId(event.over?.id);
    if (!from || !to) return;
    if (from.kind === "section") {
      const overSection = to.kind === "page" ? sections.find((s) => s.pages.some((p) => p.id === to.id))?.id : to.id;
      const move = overSection ? moveSection(sections, from.id, overSection) : null;
      if (move) handlers.onSectionMove(move);
      return;
    }
    if (from.kind === "page") {
      if (to.kind === "page") {
        const target = sections.find((s) => s.pages.some((p) => p.id === to.id));
        if (!target) return;
        const move = movePage(sections, from.id, target.id, target.pages.findIndex((p) => p.id === to.id));
        if (move) handlers.onPageMove(move);
      } else {
        const move = movePage(sections, from.id, to.id, null);
        if (move) handlers.onPageMove(move);
      }
    }
  };

  // Where the line is drawn right now, from the same rule the drop applies: down the list it lands after the row
  // under the cursor, up the list — or into another section — before it.
  const over = parseDragId(overId);
  let sectionLanding: { id: string; at: Landing } | null = null;
  let pageLanding: { pageId: string; at: Landing } | null = null;
  let joiningId: string | null = null;
  if (active?.kind === "section" && over?.kind === "section" && over.id !== active.id) {
    const from = sections.findIndex((s) => s.id === active.id);
    const to = sections.findIndex((s) => s.id === over.id);
    if (from >= 0 && to >= 0) sectionLanding = { id: over.id, at: from < to ? "after" : "before" };
  }
  if (active?.kind === "page" && over?.kind === "page") {
    const source = sections.find((s) => s.pages.some((p) => p.id === active.id));
    const target = sections.find((s) => s.pages.some((p) => p.id === over.id));
    if (source && target) {
      const same = source.id === target.id;
      const fromIndex = source.pages.findIndex((p) => p.id === active.id);
      const toIndex = target.pages.findIndex((p) => p.id === over.id);
      pageLanding = { pageId: over.id, at: same && fromIndex < toIndex ? "after" : "before" };
      if (!same) joiningId = target.id;
    }
  }
  if (active?.kind === "page" && over?.kind === "drop") joiningId = over.id;

  const activePage = active?.kind === "page" ? sections.flatMap((s) => s.pages).find((p) => p.id === active.id) : null;
  const activeSection = active?.kind === "section" ? sections.find((s) => s.id === active.id) : null;

  const overlay = (
    <DragOverlay dropAnimation={null}>
      {activePage ? (
        <PageRow page={activePage} handlers={handlers} />
      ) : activeSection ? (
        <SectionOverlayRow section={activeSection} />
      ) : null}
    </DragOverlay>
  );

  return (
    <div role="tree" aria-label={t("manage.tabs.pages")} className="flex max-w-[1000px] flex-col">
      {/* 32 + the hairline, padding 0 8, 8 between, the labels 12/16 500 tertiary (J1). */}
      <div className="flex h-[33px] items-center gap-2 border-b border-divider px-2 text-hint font-medium text-tertiary">
        <span className="min-w-0 flex-1">{t("manage.pages.columns.page")}</span>
        <span className="w-40 shrink-0">{t("manage.pages.columns.owner")}</span>
        <span className="w-[200px] shrink-0">{t("manage.pages.columns.mustRead")}</span>
        <span className={UPDATED}>{t("manage.pages.columns.updated")}</span>
        <span className="w-[72px] shrink-0" />
      </div>
      <DndContext sensors={sensors} collisionDetection={treeCollision} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd} onDragCancel={reset}>
        <SortableContext items={sections.map((s) => sectionDragId(s.id))} strategy={verticalListSortingStrategy}>
          {sections.map((section) => (
            <SectionBlock
              key={section.id}
              section={section}
              handlers={handlers}
              expanded={expandAll || open.has(section.id)}
              onToggle={() =>
                setOpen((prev) => {
                  const next = new Set(prev);
                  if (next.has(section.id)) next.delete(section.id);
                  else next.add(section.id);
                  return next;
                })
              }
              renaming={renamingId === section.id}
              setRenaming={setRenamingId}
              dragging={active?.kind ?? null}
              landing={sectionLanding && sectionLanding.id === section.id ? sectionLanding.at : null}
              pageLanding={pageLanding}
              joining={joiningId === section.id}
            />
          ))}
        </SortableContext>
        {mounted ? createPortal(overlay, document.body) : overlay}
      </DndContext>
    </div>
  );
};
