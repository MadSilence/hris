"use client";

import { FC, useLayoutEffect, useMemo, useRef, useState, type DragEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Add01Icon, ArrowDown01Icon, DragDropVerticalIcon, MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { FieldError } from "@/components/desact/field-error";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/desact/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/desact/dropdown-menu";
import { cn } from "@/lib/cn";
import type { CalendarView } from "@/models/calendarView";

/** A pill in the row: a built-in view (never stored, never moved) or one of the reader's own. */
export type ViewPill = { id: string; name: string; saved?: CalendarView };

type Props = {
  /** "Everyone" first, then "My team" when the reader has a team — not stored, not movable. */
  builtIns: ViewPill[];
  /** The reader's own views, in their order. */
  views: CalendarView[];
  activeId: string | null;
  /** The people each view shows, by view id (B5); a view without one shows its name alone. */
  counts?: Record<string, number>;
  onPick: (id: string) => void;
  onSave: (name: string) => void;
  onRename: (view: CalendarView, name: string) => void;
  onDelete: (view: CalendarView) => void;
  /** Drop saves the new order at once (N08c). */
  onReorder: (ids: string[]) => void;
  busy?: boolean;
};

const GAP = 4;
/** Room kept for "14 more ▾" when not everything fits (`vmore`, 93 wide). */
const MORE_W = 100;

const pillClass = (on: boolean) =>
  cn(
    "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-pill px-3 text-label whitespace-nowrap outline-none focus-visible:shadow-focus",
    on ? "bg-accent-subtle font-semibold text-accent-text" : "bg-mist font-medium text-secondary hover:bg-divider",
  );

/**
 * The saved views (N08, N08b, N08c, N10): pills — the picked one in the accent's subtle tint, its name 600 — then,
 * after a short divider, *Save as a view*. "Everyone" is always first and can be neither moved nor deleted.
 *
 * As many pills as fit; the rest go behind **"N more ▾"**, a scrolling list. Order is drag and drop — a pill in the
 * row or a row of the list; an accent line marks where it lands and the drop saves the order for this reader at once.
 * Dragging from the list into the row puts the view there, and the last pill that no longer fits moves to the top of
 * the list. Picking from the list shows the view in the row in place of the last pill, for this visit only. ⋯ on a
 * view of the reader's own: Rename, Delete.
 *
 * Each name carries a plain count (13/18 400 tertiary, no bubble; it stays 400 on the picked view) — the people the
 * view shows within the reader's own scope (B5).
 */
export const CompanyCalendarViewsRow: FC<Props> = ({
  builtIns,
  views,
  activeId,
  counts = {},
  onPick,
  onSave,
  onRename,
  onDelete,
  onReorder,
  busy = false,
}) => {
  const t = useTranslations("calendar");
  const tCommon = useTranslations("common");
  const all = useMemo<ViewPill[]>(
    () => [...builtIns, ...views.map((v) => ({ id: v.id, name: v.name, saved: v }))],
    [builtIns, views],
  );

  // ── How many fit: every pill is measured once in a hidden copy of the row ──
  const countsKey = JSON.stringify(counts);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const tailRef = useRef<HTMLDivElement | null>(null);
  const [fit, setFit] = useState(all.length);
  useLayoutEffect(() => {
    const row = rowRef.current;
    const measure = measureRef.current;
    if (!row || !measure) return;
    const compute = () => {
      const widths = Array.from(measure.children).map((c) => (c as HTMLElement).offsetWidth);
      const room = row.clientWidth - (tailRef.current?.offsetWidth ?? 0) - GAP;
      const total = widths.reduce((sum, w) => sum + w + GAP, 0);
      if (row.clientWidth === 0 || total <= room) {
        setFit(all.length);
        return;
      }
      let used = MORE_W;
      let count = 0;
      for (const w of widths) {
        if (used + w + GAP > room) break;
        used += w + GAP;
        count += 1;
      }
      setFit(Math.max(1, count));
    };
    compute();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(compute);
    observer.observe(row);
    return () => observer.disconnect();
    // The counts arrive after the names and widen the pills: measured again then.
  }, [all, countsKey]);

  // A view picked from the list stands in the row in place of the last pill, for this visit only.
  const [promoted, setPromoted] = useState<string | null>(null);
  const shown = useMemo(() => {
    const visible = all.slice(0, fit);
    const promotedPill = promoted ? all.find((p) => p.id === promoted) : undefined;
    if (promotedPill && !visible.some((p) => p.id === promotedPill.id) && visible.length > builtIns.length) {
      visible[visible.length - 1] = promotedPill;
    }
    return visible;
  }, [all, fit, promoted, builtIns.length]);
  const hidden = all.filter((p) => !shown.some((s) => s.id === p.id));

  // ── Drag and drop over the reader's own views ──
  const [dragId, setDragId] = useState<string | null>(null);
  /** The saved view the dragged one lands before; null is the end. */
  const [dropBefore, setDropBefore] = useState<string | null | undefined>(undefined);
  const savedIds = views.map((v) => v.id);
  const drop = () => {
    if (dragId && dropBefore !== undefined && dropBefore !== dragId) {
      const rest = savedIds.filter((id) => id !== dragId);
      const at = dropBefore === null ? rest.length : rest.indexOf(dropBefore);
      const next = [...rest.slice(0, at), dragId, ...rest.slice(at)];
      if (next.join() !== savedIds.join()) onReorder(next);
    }
    setDragId(null);
    setDropBefore(undefined);
  };
  const dragProps = (pill: ViewPill) =>
    pill.saved
      ? {
          draggable: true,
          onDragStart: (e: DragEvent) => {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", pill.id);
            setDragId(pill.id);
          },
          onDragEnd: () => {
            setDragId(null);
            setDropBefore(undefined);
          },
          onDragOver: (e: DragEvent<HTMLElement>) => {
            if (!dragId) return;
            e.preventDefault();
            const box = e.currentTarget.getBoundingClientRect();
            const vertical = e.currentTarget.dataset.list !== undefined;
            const after = vertical ? e.clientY > box.top + box.height / 2 : e.clientX > box.left + box.width / 2;
            const i = savedIds.indexOf(pill.id);
            setDropBefore(after ? (savedIds[i + 1] ?? null) : pill.id);
          },
          onDrop: (e: DragEvent) => {
            e.preventDefault();
            drop();
          },
        }
      : {};

  const [moreOpen, setMoreOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [renaming, setRenaming] = useState<CalendarView | null>(null);

  const count = (id: string): ReactNode =>
    counts[id] === undefined ? null : (
      <span className="font-normal text-tertiary tabular-nums">{counts[id]}</span>
    );

  const pill = (p: ViewPill, inMeasure = false): ReactNode => {
    const on = p.id === activeId;
    const marker = !inMeasure && dragId && dropBefore === p.id && p.saved;
    return (
      <span key={p.id} className="group/pill relative inline-flex shrink-0 items-center">
        {marker ? <span aria-hidden className="absolute top-1 bottom-1 -left-[3px] w-0.5 rounded-pill bg-accent" /> : null}
        <button
          type="button"
          aria-pressed={on}
          onClick={() => onPick(p.id)}
          className={cn(pillClass(on), p.saved && "cursor-grab pr-8", dragId === p.id && "shadow-drag")}
          {...(inMeasure ? {} : dragProps(p))}
        >
          {p.name}
          {count(p.id)}
        </button>
        {p.saved && !inMeasure ? (
          <ViewMenu
            name={p.name}
            className="absolute right-1.5 opacity-0 group-hover/pill:opacity-100 touch:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
            onRename={() => setRenaming(p.saved!)}
            onDelete={() => onDelete(p.saved!)}
            busy={busy}
          />
        ) : null}
      </span>
    );
  };

  return (
    <div className="relative">
      {/* The measuring copy: the same pills, unseen, so the row knows how wide each one is. */}
      <div ref={measureRef} aria-hidden className="pointer-events-none invisible absolute flex gap-1 whitespace-nowrap">
        {all.map((p) => (
          <span key={p.id} className={cn(pillClass(p.id === activeId), p.saved && "pr-8")}>
            {p.name}
            {count(p.id)}
          </span>
        ))}
      </div>

      <div ref={rowRef} className="flex min-w-0 items-center gap-1" onDragOver={(e) => dragId && e.preventDefault()} onDrop={drop}>
        {shown.map((p) => pill(p))}

        {hidden.length > 0 ? (
          <Popover open={moreOpen} onOpenChange={setMoreOpen}>
            <PopoverTrigger asChild>
              <button type="button" className={cn(pillClass(false), "bg-divider")} aria-expanded={moreOpen}>
                {t("views.more", { count: hidden.length })}
                <Icon icon={ArrowDown01Icon} size="sm" className="size-3.5 text-tertiary" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="max-h-74 w-65 overflow-y-auto p-1">
              {hidden.map((p) => (
                <div
                  key={p.id}
                  data-list=""
                  className={cn(
                    "group/item relative flex h-8 items-center gap-2.5 rounded-control px-2.5 text-body text-primary hover:bg-accent-subtle",
                    p.saved && "cursor-grab",
                    dragId === p.id && "border border-dashed border-field bg-card",
                  )}
                  {...dragProps(p)}
                >
                  {dragId && dropBefore === p.id ? (
                    <span aria-hidden className="absolute inset-x-2 -top-px h-0.5 rounded-pill bg-accent" />
                  ) : null}
                  {p.saved ? (
                    <Icon
                      icon={DragDropVerticalIcon}
                      size="sm"
                      className="absolute left-0.5 size-3.5 text-tertiary opacity-0 group-hover/item:opacity-100 touch:opacity-100"
                    />
                  ) : null}
                  <button
                    type="button"
                    className="min-w-0 flex-1 truncate text-left outline-none"
                    onClick={() => {
                      setPromoted(p.id);
                      setMoreOpen(false);
                      onPick(p.id);
                    }}
                  >
                    {p.name}
                    {counts[p.id] !== undefined ? <span className="ml-1.5 text-label text-tertiary tabular-nums">{counts[p.id]}</span> : null}
                  </button>
                  {p.saved ? (
                    <ViewMenu
                      name={p.name}
                      className="opacity-0 group-hover/item:opacity-100 touch:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
                      onRename={() => {
                        setMoreOpen(false);
                        setRenaming(p.saved!);
                      }}
                      onDelete={() => onDelete(p.saved!)}
                      busy={busy}
                    />
                  ) : null}
                </div>
              ))}
            </PopoverContent>
          </Popover>
        ) : null}

        <div ref={tailRef} className="flex shrink-0 items-center gap-1">
          <span aria-hidden className="mx-1 h-4.5 w-px bg-divider" />
          <ViewNamePopover
            open={saveOpen}
            onOpenChange={setSaveOpen}
            title={t("views.saveAsView")}
            submitLabel={t("views.saveView")}
            initial=""
            busy={busy}
            onSubmit={(name) => {
              onSave(name);
              setSaveOpen(false);
            }}
            trigger={
              <Button type="button" variant="ghost" size="sm" className="text-accent-text" disabled={busy}>
                <Icon icon={Add01Icon} size="sm" />
                {t("views.saveAsView")}
              </Button>
            }
          />
        </div>
      </div>

      {renaming ? (
        <ViewNamePopover
          open
          onOpenChange={(open) => !open && setRenaming(null)}
          title={t("views.renameTitle")}
          submitLabel={tCommon("actions.save")}
          initial={renaming.name}
          busy={busy}
          onSubmit={(name) => {
            onRename(renaming, name);
            setRenaming(null);
          }}
          anchor
        />
      ) : null}
    </div>
  );
};

/** ⋯ on a view of the reader's own: Rename, Delete. */
const ViewMenu: FC<{ name: string; className?: string; onRename: () => void; onDelete: () => void; busy: boolean }> = ({
  name,
  className,
  onRename,
  onDelete,
  busy,
}) => {
  const t = useTranslations("calendar");
  const tCommon = useTranslations("common");
  const renameRequested = useRef(false);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("views.actions", { name })}
          disabled={busy}
          className={cn("flex size-5 items-center justify-center rounded-control text-tertiary outline-none hover:bg-divider", className)}
          onClick={(e) => e.stopPropagation()}
        >
          <Icon icon={MoreHorizontalIcon} size="sm" className="size-3.5" />
        </button>
      </DropdownMenuTrigger>
      {/* The menu hands focus back to ⋯ as it closes, which is outside the rename popover and closed it at once
          (walk of 2026-11-23): after Rename the focus stays where the popover puts it. */}
      <DropdownMenuContent
        align="end"
        onCloseAutoFocus={(event) => {
          if (!renameRequested.current) return;
          renameRequested.current = false;
          event.preventDefault();
        }}
      >
        <DropdownMenuItem
          onSelect={() => {
            renameRequested.current = true;
            onRename();
          }}
        >
          {tCommon("actions.rename")}
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          {tCommon("actions.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/**
 * *Save as a view* (N10) and Rename: a popover, the title 15/22 600, "Name" over the field, Cancel and the main button
 * on the right. No hint, no divider. A saved view is seen only by its author.
 */
const ViewNamePopover: FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  submitLabel: string;
  initial: string;
  busy: boolean;
  onSubmit: (name: string) => void;
  trigger?: ReactNode;
  /** Rename opens from a menu: the popover stands under the row instead of under a button. */
  anchor?: boolean;
}> = ({ open, onOpenChange, title, submitLabel, initial, busy, onSubmit, trigger, anchor }) => {
  const t = useTranslations("calendar");
  const tCommon = useTranslations("common");
  const [name, setName] = useState(initial);
  const [tried, setTried] = useState(false);
  const change = (next: boolean) => {
    if (next) {
      setName(initial);
      setTried(false);
    }
    onOpenChange(next);
  };
  const submit = () => {
    setTried(true);
    if (!name.trim() || busy) return;
    onSubmit(name.trim());
  };
  return (
    <Popover open={open} onOpenChange={change}>
      {trigger ? <PopoverTrigger asChild>{trigger}</PopoverTrigger> : null}
      {anchor ? (
        <PopoverAnchor asChild>
          <span className="absolute bottom-0 left-0" />
        </PopoverAnchor>
      ) : null}
      <PopoverContent align="start" className="flex w-80 flex-col gap-4 rounded-card p-4">
        <p className="font-heading text-card-title text-primary">{title}</p>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="calendar-view-name" className="text-label text-primary">
            {t("views.name")}
          </Label>
          <Input
            id="calendar-view-name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            onKeyDown={(e) => {
              // i18n-exempt: a key name, not text
              if (e.key === "Enter") submit();
            }}
          />
          <FieldError>{tried && !name.trim() ? tCommon("validation.enterName") : null}</FieldError>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            {tCommon("actions.cancel")}
          </Button>
          <Button type="button" size="sm" disabled={busy} onClick={submit}>
            {submitLabel}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
