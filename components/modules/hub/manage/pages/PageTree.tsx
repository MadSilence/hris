"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

/** The tree's columns: Page, Owner, Must read, Updated, and the row menu. */
const GRID = "grid grid-cols-[minmax(0,1fr)_150px_180px_80px_72px] items-center gap-3";

export type PageTreeHandlers = {
  onSectionMove: (move: SectionMove) => void;
  onPageMove: (move: PageMove) => void;
  onAddPage: (sectionId: string) => void;
  onRenameSection: (section: TreeSection, name: string) => void;
  onSectionAppearance: (section: TreeSection) => void;
  onSectionAudience: (section: TreeSection) => void;
  onDeleteSection: (section: TreeSection) => void;
  onMovePageTo: (page: TreePage) => void;
  onDuplicatePage: (page: TreePage) => void;
  onUnpublishPage: (page: TreePage) => void;
  onDeletePage: (page: TreePage) => void;
  /** Sections — their menu, their order, deleting a page — are MANAGE (design § 5.1). */
  canManage: boolean;
};

type SortableBits = Pick<ReturnType<typeof useSortable>, "setNodeRef" | "attributes" | "listeners" | "transform" | "transition" | "isDragging" | "isOver">;

/** A page row that drags (`useSortable`); the overlay draws the same row without it. */
const SortablePageRow: React.FC<{ page: TreePage; handlers: PageTreeHandlers }> = ({ page, handlers }) => {
  const sortable = useSortable({ id: pageDragId(page.id) });
  return <PageRow page={page} handlers={handlers} sortable={sortable} />;
};

const PageRow: React.FC<{ page: TreePage; handlers: PageTreeHandlers; sortable?: SortableBits }> = ({ page, handlers, sortable }) => {
  const t = useTranslations("hub");
  const router = useRouter();
  const dates = useHubDates();
  const overlay = !sortable;
  const style = sortable ? { transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition } : undefined;
  return (
    <div
      ref={sortable?.setNodeRef}
      style={style}
      className={cn(
        GRID,
        "group h-11 border-b border-divider pr-1 pl-12 hover:bg-row-hover",
        sortable?.isDragging && "opacity-40",
        sortable?.isOver && "border-t-2 border-t-accent",
        overlay && "rounded-control bg-card shadow-drag",
      )}
    >
      <span className="relative flex min-w-0 items-center gap-2">
        <button
          type="button"
          aria-label={t("manage.pages.dragToMove")}
          className="absolute -left-8 flex h-6 w-5 cursor-grab items-center justify-center rounded-control text-tertiary opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          {...(sortable?.attributes ?? {})}
          {...(sortable?.listeners ?? {})}
        >
          <Icon icon={DragDropVerticalIcon} size="sm" />
        </button>
        <Icon icon={hubIcon(page.icon)} size="sm" className="shrink-0 text-tertiary" />
        <Link href={`/hub/manage/pages/${page.id}/edit`} className="flex min-w-0 text-body text-primary no-underline hover:underline">
          <TruncatedTitle title={page.title || t("manage.untitled")} />
        </Link>
        {page.status !== "PUBLISHED" && <span className="shrink-0 text-hint text-tertiary">{t(`manage.pageStatus.${page.status}`)}</span>}
      </span>
      <span className="flex min-w-0 items-center gap-2 text-body text-secondary">
        {page.owner && (
          <>
            <PersonAvatar person={page.owner} />
            <span className="truncate">{firstNameOf(page.owner.name)}</span>
          </>
        )}
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        {page.mustRead ? (
          <>
            <span className="text-hint text-secondary tabular-nums">{t("manage.agreedOf", { agreed: page.agreed, needed: page.needed })}</span>
            <ProgressBar value={page.agreed} max={page.needed} className="w-28" />
          </>
        ) : (
          <span className="text-body text-tertiary">—</span>
        )}
      </span>
      <span className="text-label text-tertiary tabular-nums">{dates.short(page.updatedAt)}</span>
      <span className="flex justify-end">
        <RowActionsMenu label={t("manage.pageMenu", { title: page.title })}>
          <RowAction icon={<Icon icon={PencilEdit02Icon} size="sm" />} onClick={() => router.push(`/hub/manage/pages/${page.id}/edit`)}>
            {t("manage.menu.edit")}
          </RowAction>
          {page.mustRead && (
            <RowAction icon={<Icon icon={CheckmarkCircle02Icon} size="sm" />} onClick={() => router.push(`/hub/manage/pages/${page.id}/agreed`)}>
              {t("manage.menu.whoAgreed")}
            </RowAction>
          )}
          <RowAction icon={<Icon icon={ArrowTurnBackwardIcon} size="sm" />} onClick={() => handlers.onMovePageTo(page)}>
            {t("manage.menu.moveTo")}
          </RowAction>
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
      </span>
    </div>
  );
};

const SectionName: React.FC<{ section: TreeSection; renaming: boolean; onRename: (name: string | null) => void }> = ({ section, renaming, onRename }) => {
  const t = useTranslations("hub");
  const [value, setValue] = React.useState(section.name);
  React.useEffect(() => setValue(section.name), [section.name, renaming]);
  if (!renaming) return <span className="truncate text-body font-semibold text-primary">{section.name}</span>;
  return (
    <input
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

const SectionBlock: React.FC<{
  section: TreeSection;
  handlers: PageTreeHandlers;
  expanded: boolean;
  onToggle: () => void;
  renaming: boolean;
  setRenaming: (id: string | null) => void;
  dragging: "page" | "section" | null;
}> = ({ section, handlers, expanded, onToggle, renaming, setRenaming, dragging }) => {
  const t = useTranslations("hub");
  const [all, setAll] = React.useState(false);
  const sortable = useSortable({ id: sectionDragId(section.id), disabled: !handlers.canManage });
  const drop = useDroppable({ id: dropDragId(section.id) });
  const style = { transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition };
  const pages = all ? section.pages : section.pages.slice(0, 3);
  const joining = dragging === "page" && (drop.isOver || sortable.isOver);

  return (
    <div ref={sortable.setNodeRef} style={style} className={cn(sortable.isDragging && "opacity-40")}>
      <div
        ref={drop.setNodeRef}
        className={cn(
          GRID,
          "group h-11 border-b border-divider pr-1",
          joining ? "bg-accent-subtle" : "hover:bg-row-hover",
          dragging === "section" && sortable.isOver && "border-t-2 border-t-accent",
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            aria-label={t("manage.pages.dragToMove")}
            className="flex h-6 w-5 cursor-grab items-center justify-center rounded-control text-tertiary opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            {...sortable.attributes}
            {...sortable.listeners}
          >
            <Icon icon={DragDropVerticalIcon} size="sm" />
          </button>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-label={section.name}
            className="flex size-6 items-center justify-center rounded-control text-tertiary hover:bg-mist"
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
          <span className="shrink-0 text-hint text-tertiary">{t("handbook.pages", { count: section.pages.length })}</span>
        </span>
        <span />
        <span className="text-hint text-secondary">{section.mustReadCount > 0 ? t("manage.pages.mustReadCount", { count: section.mustReadCount }) : ""}</span>
        <span />
        <span className="flex items-center justify-end gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="icon-sm" aria-label={t("manage.pages.addToSection")} onClick={() => handlers.onAddPage(section.id)}>
                <Icon icon={Add01Icon} size="sm" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("manage.pages.addToSection")}</TooltipContent>
          </Tooltip>
          <RowActionsMenu label={t("manage.pages.sectionOptions")} disabled={!handlers.canManage}>
            <RowAction icon={<Icon icon={PencilEdit02Icon} size="sm" />} onClick={() => setRenaming(section.id)}>
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
        </span>
      </div>
      {expanded && (
        <SortableContext items={pages.map((p) => pageDragId(p.id))} strategy={verticalListSortingStrategy}>
          {pages.map((page) => (
            <SortablePageRow key={page.id} page={page} handlers={handlers} />
          ))}
          {!all && section.pages.length > 3 && (
            <div className="border-b border-divider py-2 pl-12">
              <Button type="button" variant="link" size="sm" onClick={() => setAll(true)}>
                {t("manage.pages.morePages", { count: section.pages.length - 3 })}
              </Button>
            </div>
          )}
        </SortableContext>
      )}
    </div>
  );
};

/**
 * The handbook as a tree (`PageTree`, CM03): sections with their pages, drag and drop within a section, into another
 * one (a drop on a section's row adds the page at its end) and among sections. Moves are saved at once; the caller
 * owns the requests and the Undo.
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

  const onDragStart = (event: DragStartEvent) => {
    const parsed = parseDragId(event.active.id);
    if (parsed && parsed.kind !== "drop") setActive({ kind: parsed.kind, id: parsed.id });
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActive(null);
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

  const activePage = active?.kind === "page" ? sections.flatMap((s) => s.pages).find((p) => p.id === active.id) : null;
  const activeSection = active?.kind === "section" ? sections.find((s) => s.id === active.id) : null;

  return (
    <div role="tree" aria-label={t("manage.tabs.pages")} className="flex max-w-[1000px] flex-col">
      <div className={cn(GRID, "h-9 border-b border-divider pr-1 pl-7 text-hint text-tertiary")}>
        <span>{t("manage.pages.columns.page")}</span>
        <span>{t("manage.pages.columns.owner")}</span>
        <span>{t("manage.pages.columns.mustRead")}</span>
        <span>{t("manage.pages.columns.updated")}</span>
        <span />
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActive(null)}
      >
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
            />
          ))}
        </SortableContext>
        <DragOverlay>
          {activePage ? (
            <PageRow page={activePage} handlers={handlers} />
          ) : activeSection ? (
            <div className="flex h-11 items-center gap-2 rounded-control bg-card px-3 shadow-drag">
              <IconTile icon={hubIcon(activeSection.icon)} color={activeSection.color} size={24} />
              <span className="text-body font-semibold text-primary">{activeSection.name}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
