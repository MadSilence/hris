"use client";

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Cancel01Icon, Delete02Icon, DragDropVerticalIcon, MinusSignIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/desact/popover";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Illustration } from "@/components/illustrations";
import { cn } from "@/lib/cn";
import type { HomeHeaderStyle, HomeWidgetPlacement, HomeWidgetSize } from "@/models/home";
import {
  COLUMNS,
  HOME_CATEGORIES,
  HOME_CATEGORY_LABEL_KEYS,
  SIZE_CELLS,
  addAt,
  defaultHome,
  moveTo,
  removeWidget,
  resizeWidget,
  rowsUsed,
  sameHome,
  toPlacements,
  type HomeCategory,
  type HomeRole,
  type PlacedWidget,
} from "@/components/modules/home/layout";
import type { HomeWidgetDefinition } from "@/components/modules/home/widgets";
import { useSaveHomeSettings } from "@/components/modules/home/hooks";
import { WidgetCell, WidgetGrid } from "@/components/modules/home/components/WidgetGrid";
import { HomeBand } from "@/components/modules/home/components/HomeHeader";

type Placed = PlacedWidget<HomeWidgetDefinition>;

/** Home's grid in true pixels: rows of 160, a gap of 24 (Part 3). */
const ROW = 160;
const GAP = 24;
/** Home's padding on either side of its container, and the widest the container gets (Part 3). */
const HOME_PADDING = 56;
const HOME_MAX = 1200;
/** The panel is 480 wide and the edit bar stops 40 short of it (E2). */
const PANEL = 480;
/** A press that moves less than this is a click, not a drag. */
const DRAG_THRESHOLD = 4;

/** A widget's footprint at one column width, for drawing it whole and scaling it down. */
const pixelsOf = (size: HomeWidgetSize, column: number) => ({
  w: SIZE_CELLS[size].columns * column + (SIZE_CELLS[size].columns - 1) * GAP,
  h: SIZE_CELLS[size].rows * ROW + (SIZE_CELLS[size].rows - 1) * GAP,
});
/** The panel's preview box: 156 × 132 on Mist, the widget scaled to fit 140 × 116, drawn at a 254 column. */
const PREVIEW = { w: 140, h: 116, column: 254 };

/** The sizes a widget comes in: the small switch, 28 high (E11b). */
const SizeSwitch: React.FC<{
  widget: HomeWidgetDefinition;
  value: HomeWidgetSize;
  onChange: (size: HomeWidgetSize) => void;
}> = ({ widget, value, onChange }) => {
  const t = useTranslations("home");
  if (widget.sizes.length === 1) return <span className="text-hint leading-5 text-tertiary">{t("sizes.smallOnly")}</span>;
  return (
    <SegmentedControl<HomeWidgetSize>
      aria-label={t("sizes.label", { size: t(`sizes.${value}`) })}
      value={value}
      onChange={onChange}
      fill={false}
      size="sm"
      options={widget.sizes.map((size) => ({ value: size, label: t(`sizes.${size}`) }))}
    />
  );
};

/**
 * A widget as it is on Home, but nothing in it can be clicked (E18): the same colours and buttons, never greyed —
 * `pointer-events: none` on its content, and `preview` keeps it out of the tab order.
 */
const Inert: React.FC<{ widget: HomeWidgetDefinition; size: HomeWidgetSize }> = ({ widget, size }) => (
  <div className="pointer-events-none h-full" aria-hidden>
    <widget.Component size={size} preview />
  </div>
);

/** A widget drawn at its true size and scaled to fit a box — the panel's preview, with the person's real data. */
const ScaledWidget: React.FC<{ widget: HomeWidgetDefinition; size: HomeWidgetSize }> = ({ widget, size }) => {
  const { w, h } = pixelsOf(size, PREVIEW.column);
  const scale = Math.min(PREVIEW.w / w, PREVIEW.h / h);
  return (
    <span style={{ width: w, height: h, zoom: scale }} className="block">
      <Inert widget={widget} size={size} />
    </span>
  );
};

/** The "+" of a panel row (E11): a 32 outline square in the accent, a plus icon 16 centred. */
const AddButton: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className="flex size-8 shrink-0 items-center justify-center self-center rounded-control border border-accent bg-transparent text-accent-text"
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  </button>
);

/** One row of the widgets panel (E10, E19, E20): preview, name, description, sizes, and + or "On your home". */
const CatalogRow: React.FC<{
  widget: HomeWidgetDefinition;
  onHome: boolean;
  size: HomeWidgetSize;
  match: string;
  onSize: (size: HomeWidgetSize) => void;
  onAdd: () => void;
  onPress: (event: React.PointerEvent) => void;
}> = ({ widget, onHome, size, match, onSize, onAdd, onPress }) => {
  const t = useTranslations("home");
  const name = t(widget.titleKey);
  const mark = (text: string) => {
    if (!match) return text;
    const at = text.toLocaleLowerCase().indexOf(match.toLocaleLowerCase());
    if (at < 0) return text;
    return (
      <>
        {text.slice(0, at)}
        <mark className="rounded-glyph bg-accent-subtle text-primary">{text.slice(at, at + match.length)}</mark>
        {text.slice(at + match.length)}
      </>
    );
  };
  return (
    <li className={cn("flex items-center gap-4 py-3", !onHome && "hover:bg-mist")}>
      <span
        onPointerDown={onHome ? undefined : onPress}
        className={cn(
          "flex h-[132px] w-[156px] shrink-0 touch-none items-center justify-center overflow-hidden rounded-tint bg-mist select-none",
          !onHome && "cursor-grab",
        )}
        aria-hidden
      >
        <ScaledWidget widget={widget} size={size} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="line-clamp-2 text-body leading-[18px] font-medium text-primary">{mark(name)}</p>
        <p className="line-clamp-2 text-hint leading-[18px] text-tertiary">{mark(t(widget.descriptionKey))}</p>
        <SizeSwitch widget={widget} value={size} onChange={onSize} />
      </div>
      {onHome ? (
        <span className="shrink-0 self-center text-hint leading-5 text-tertiary">{t("edit.onYourHome")}</span>
      ) : (
        <AddButton label={t("edit.add", { name })} onClick={onAdd} />
      )}
    </li>
  );
};

/** The panel's search (E12): one 36-high field, the icon inside on the left, a plain × inside on the right. */
const PanelSearch: React.FC<{ value: string; onChange: (value: string) => void; placeholder: string; clearLabel: string }> = ({
  value,
  onChange,
  placeholder,
  clearLabel,
}) => (
  <div
    className={cn(
      "flex h-9 w-full items-center gap-2 rounded-control border px-3",
      value ? "border-accent" : "border-field focus-within:border-accent",
    )}
  >
    <Icon icon={Search01Icon} size="sm" className="text-tertiary" />
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Escape" && value) {
          event.preventDefault();
          onChange("");
        }
      }}
      placeholder={placeholder}
      aria-label={placeholder}
      className="min-w-0 flex-1 bg-transparent text-body text-primary outline-none placeholder:text-tertiary [&::-webkit-search-cancel-button]:hidden"
    />
    {value && (
      <button type="button" aria-label={clearLabel} onClick={() => onChange("")} className="shrink-0 text-tertiary hover:text-primary">
        <Icon icon={Cancel01Icon} size="sm" />
      </button>
    )}
  </div>
);

/** What is being dragged: a widget on the page, or one from the panel at the size its row picked. */
type Drag = {
  id: string;
  size: HomeWidgetSize;
  from: "page" | "panel";
  /** Where the pointer is, and where it holds the widget from its top-left corner (true pixels). */
  x: number;
  y: number;
  grabX: number;
  grabY: number;
};

/** The edit bar's width and Home's content width — the zoom is one over the other (E2, E3). */
const useMeasures = () => {
  const root = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [measures, setMeasures] = useState({ barWidth: 894, homeWidth: HOME_MAX });
  useLayoutEffect(() => {
    const read = () => {
      const page = root.current?.clientWidth ?? 0;
      const barWidth = barRef.current?.clientWidth ?? 0;
      if (!page || !barWidth) return;
      // Home's content: the page less its padding, at most 1200 — the page here is `main` with the panel's room.
      setMeasures({ barWidth, homeWidth: Math.min(HOME_MAX, page - 2 * HOME_PADDING) });
    };
    read();
    const observer = new ResizeObserver(read);
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  return { root, barRef, ...measures };
};

/**
 * Edit home (`home-edit`; the designers' Home fixes E1–E21): Home's own page at its true width, zoomed to the edit
 * bar's width beside the widgets panel. Add, drag (pointer events — from the panel and on the page), resize, remove,
 * the header and Reset — and nothing changes until Save. Each widget keeps the cell it is dropped on; empty cells are
 * allowed, and a widget dropped on another pushes that one down. Undo in a toast for add, remove and reset, and the
 * session's toasts leave with it. Cancel confirms only when there are changes.
 */
export const EditHome: React.FC<{
  available: HomeWidgetDefinition[];
  start: Placed[];
  header: HomeHeaderStyle;
  /** The company's default header (Appearance's background), what Reset goes back to. */
  headerDefault?: HomeHeaderStyle;
  role: HomeRole;
  stored: HomeWidgetPlacement[];
  onClose: () => void;
}> = ({ available, start, header: startHeader, headerDefault = "COLOUR", role, stored, onClose }) => {
  const t = useTranslations("home");
  const save = useSaveHomeSettings();
  const [placed, setPlaced] = useState<Placed[]>(start);
  const [header, setHeaderState] = useState<HomeHeaderStyle>(startHeader);
  /** After Reset the header follows the company again, until the person picks one (sign-in-appearance, Q-26). */
  const [followCompany, setFollowCompany] = useState(false);
  const setHeader = (next: HomeHeaderStyle) => {
    setHeaderState(next);
    setFollowCompany(false);
  };
  const [selected, setSelected] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [dropCell, setDropCell] = useState<{ col: number; row: number } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<HomeCategory | "ALL">("FOR_ME");
  const [rowSizes, setRowSizes] = useState<Record<string, HomeWidgetSize>>({});
  const grid = useRef<HTMLDivElement>(null);
  const toasts = useRef<(string | number)[]>([]);
  const { root, barRef, barWidth, homeWidth } = useMeasures();
  const zoom = barWidth / homeWidth;
  const column = (homeWidth - (COLUMNS - 1) * GAP) / COLUMNS;
  const colour = header === "COLOUR";

  // E1: opened from the end of Home, the editor starts at its top — the bar, Cancel and Save in view.
  useEffect(() => {
    root.current?.scrollIntoView({ block: "start" });
  }, [root]);

  // E16: this session's toasts never outlive it — and never offer Undo for a session that is gone.
  const close = useCallback(() => {
    toasts.current.forEach((id) => toast.dismiss(id));
    toasts.current = [];
    onClose();
  }, [onClose]);
  useEffect(() => () => toasts.current.forEach((id) => toast.dismiss(id)), []);
  const remember = (id: string | number) => {
    toasts.current.push(id);
  };

  const changed = header !== startHeader || !sameHome(placed, start);
  const onHome = new Set(placed.map((p) => p.widget.id));
  const sizeFor = (widget: HomeWidgetDefinition) => rowSizes[widget.id] ?? widget.defaultSize;

  /** A change that a toast can take back: the page before it comes back on Undo. */
  const undoable = (next: Placed[], message: string) => {
    const before = placed;
    setPlaced(next);
    remember(toast.success(message, { action: { label: t("card.undo"), onClick: () => setPlaced(before) } }));
  };

  /** "+" puts the widget in the first free cell it fits; a drop puts it in the cell under the pointer. */
  const add = (widget: HomeWidgetDefinition, widgetSize: HomeWidgetSize, at?: { col: number; row: number }) => {
    undoable(addAt(placed, widget, widgetSize, at), t("edit.toasts.added", { name: t(widget.titleKey) }));
    setJustAdded(widget.id);
    setTimeout(() => setJustAdded((current) => (current === widget.id ? null : current)), 1500);
  };
  const remove = (widget: HomeWidgetDefinition) => {
    setSelected(null);
    undoable(removeWidget(placed, widget.id), t("edit.toasts.removed", { name: t(widget.titleKey) }));
  };
  const reset = () => {
    const before = { placed, header };
    setPlaced(defaultHome(available, role));
    setHeaderState(headerDefault);
    setFollowCompany(true);
    remember(
      toast.success(t("edit.toasts.reset"), {
        action: {
          label: t("card.undo"),
          onClick: () => {
            setPlaced(before.placed);
            setHeader(before.header);
          },
        },
      }),
    );
  };

  const doSave = () => {
    if (save.isPending) return;
    save.mutate(
      {
        homeLayout: toPlacements(placed, available, stored),
        // Sent only when it changed: a save of the widgets alone must not pin the company's default as a choice.
        ...(followCompany ? { homeHeader: "DEFAULT" as const } : header !== startHeader ? { homeHeader: header } : {}),
      },
      {
        onSuccess: () => {
          close();
          toast.success(t("edit.toasts.saved"));
        },
        onError: () => {
          remember(toast.error(t("edit.toasts.saveFailed"), { action: { label: t("edit.toasts.retry"), onClick: doSave } }));
        },
      },
    );
  };

  const cancel = () => (changed ? setConfirming(true) : close());

  // ── drag and drop (E14, E15): pointer events, a lifted widget, a drop place in grid cells ─────────────────────
  /** The cell the dragged widget's top-left corner would land on, or null off the grid. */
  const cellAt = useCallback(
    (d: Drag): { col: number; row: number } | null => {
      const box = grid.current?.getBoundingClientRect();
      if (!box) return null;
      if (d.x < box.left || d.x > box.right + 40 || d.y < box.top - 40) return null;
      // The grid's box is drawn zoomed: back to true pixels, then the widget's corner from where it is held.
      const left = (d.x - box.left) / zoom - d.grabX;
      const top = (d.y - box.top) / zoom - d.grabY;
      const cells = SIZE_CELLS[d.size];
      const col = Math.round(left / (column + GAP)) + 1;
      const row = Math.round(top / (ROW + GAP)) + 1;
      return { col: Math.max(1, Math.min(col, COLUMNS - cells.columns + 1)), row: Math.max(1, row) };
    },
    [column, zoom],
  );

  /** A press that turns into a drag once it moves; a press that does not move is the click it always was. */
  const press = (event: React.PointerEvent, what: Omit<Drag, "x" | "y" | "grabX" | "grabY">, grabScale: number, onClick?: () => void) => {
    if (event.button !== 0) return;
    const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const grabX = (startX - box.left) / grabScale;
    const grabY = (startY - box.top) / grabScale;
    let started = false;
    const move = (e: PointerEvent) => {
      if (!started && Math.hypot(e.clientX - startX, e.clientY - startY) < DRAG_THRESHOLD) return;
      if (!started) {
        started = true;
        setSelected(null);
      }
      const next = { ...what, x: e.clientX, y: e.clientY, grabX, grabY };
      setDrag(next);
      setDropCell(cellAt(next));
    };
    const up = (e: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancelDrag);
      if (!started) {
        onClick?.();
        return;
      }
      const at = cellAt({ ...what, x: e.clientX, y: e.clientY, grabX, grabY });
      setDrag(null);
      setDropCell(null);
      if (!at) return;
      if (what.from === "page") {
        setPlaced((current) => moveTo(current, what.id, at.col, at.row));
      } else {
        const widget = available.find((w) => w.id === what.id);
        if (widget) add(widget, what.size, at);
      }
    };
    const cancelDrag = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancelDrag);
      setDrag(null);
      setDropCell(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancelDrag);
  };

  // ── the panel ────────────────────────────────────────────────────────────────────────────────────────────────
  const term = search.trim().toLocaleLowerCase();
  const matches = (w: HomeWidgetDefinition) =>
    !term || t(w.titleKey).toLocaleLowerCase().includes(term) || t(w.descriptionKey).toLocaleLowerCase().includes(term);
  const found = available.filter(matches);
  const counts = useMemo(
    () => Object.fromEntries(HOME_CATEGORIES.map((c) => [c, available.filter((w) => w.category === c).length])) as Record<HomeCategory, number>,
    [available],
  );
  const listed = term ? found : category === "ALL" ? available : available.filter((w) => w.category === category);

  const row = (widget: HomeWidgetDefinition) => (
    <CatalogRow
      key={widget.id}
      widget={widget}
      onHome={onHome.has(widget.id)}
      size={sizeFor(widget)}
      match={search.trim()}
      onSize={(next) => setRowSizes((current) => ({ ...current, [widget.id]: next }))}
      onAdd={() => add(widget, sizeFor(widget))}
      onPress={(event) => {
        const widgetSize = sizeFor(widget);
        const { w, h } = pixelsOf(widgetSize, PREVIEW.column);
        press(event, { id: widget.id, size: widgetSize, from: "panel" }, Math.min(PREVIEW.w / w, PREVIEW.h / h));
      }}
    />
  );

  /** E8: the category chips — Mist with no border, the picked one Ink with white words. */
  const chip = (key: string, label: string, count: number, picked: boolean, onClick: () => void) => (
    <button
      key={key}
      type="button"
      aria-pressed={picked}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-pill px-3 text-label leading-5",
        picked ? "bg-inverse text-on-inverse" : "bg-mist text-secondary hover:text-primary",
      )}
    >
      {label}
      <span className="font-normal opacity-60">{count}</span>
    </button>
  );

  // ── the page ─────────────────────────────────────────────────────────────────────────────────────────────────
  const dragging = drag !== null;
  const cells: React.ReactNode[] = placed.map((entry) => {
    const widget = entry.widget;
    const name = t(widget.titleKey);
    const isSelected = selected === widget.id;
    const lifted = drag?.from === "page" && drag.id === widget.id;
    return (
      <WidgetCell
        key={widget.id}
        size={entry.size}
        col={entry.col}
        row={entry.row}
        data-just-added={justAdded === widget.id ? "true" : undefined}
        className={cn(
          "relative rounded-widget transition-transform duration-(--duration-reorder)",
          isSelected ? "-translate-y-2 shadow-drag ring-[3px] ring-accent" : "ring-[1.5px] ring-accent/25 hover:ring-2",
          lifted && "opacity-0",
        )}
      >
        <Inert widget={widget} size={entry.size} />
        <Popover open={isSelected && !dragging} onOpenChange={(open) => setSelected(open ? widget.id : null)}>
          <PopoverAnchor asChild>
            <button
              type="button"
              aria-label={t("edit.drag", { name })}
              onPointerDown={(event) =>
                press(event, { id: widget.id, size: entry.size, from: "page" }, zoom, () => setSelected(isSelected ? null : widget.id))
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelected(isSelected ? null : widget.id);
                }
              }}
              className="absolute inset-0 z-10 cursor-grab touch-none rounded-widget"
            />
          </PopoverAnchor>
          <PopoverContent align="center" className="flex w-auto items-center gap-2 p-2">
            <SizeSwitch widget={widget} value={entry.size} onChange={(next) => setPlaced(resizeWidget(placed, widget.id, next))} />
            {!widget.locked && (
              <>
                <span aria-hidden className="h-6 w-px bg-divider" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t("edit.removeFromHome")}
                  title={t("edit.removeFromHome")}
                  className="text-danger-text"
                  onClick={() => remove(widget)}
                >
                  <Icon icon={Delete02Icon} size="sm" />
                </Button>
              </>
            )}
          </PopoverContent>
        </Popover>
        <span aria-hidden className="pointer-events-none absolute top-2 left-1/2 z-20 -translate-x-1/2 text-tertiary">
          <Icon icon={DragDropVerticalIcon} size="sm" className="rotate-90" />
        </span>
        <span aria-hidden className="pointer-events-none absolute -top-2.5 -right-2.5 z-20 flex h-6 min-w-6 items-center justify-center rounded-pill bg-card px-1.5 text-hint font-semibold text-secondary shadow-popover">
          {entry.size}
        </span>
        {!widget.locked && (
          <button
            type="button"
            aria-label={t("edit.remove", { name })}
            onClick={() => remove(widget)}
            className="absolute -top-3 -left-3 z-20 flex size-[30px] items-center justify-center rounded-pill bg-card text-danger-text shadow-popover hover:bg-subtle"
          >
            <Icon icon={MinusSignIcon} size="sm" />
          </button>
        )}
      </WidgetCell>
    );
  });
  if (drag && dropCell) {
    cells.push(
      <WidgetCell
        key="drop-place"
        size={drag.size}
        col={dropCell.col}
        row={dropCell.row}
        className="pointer-events-none rounded-widget border-[1.5px] border-dashed border-accent-muted"
      />,
    );
  }
  if (placed.length === 0 && !dragging) {
    cells.push(
      <div
        key="drop-here"
        className="pointer-events-none col-span-4 row-span-2 flex items-center justify-center rounded-widget border-2 border-dashed border-accent-ring bg-accent-subtle text-section-title text-accent-text"
      >
        {t("edit.dropHere")}
      </div>,
    );
  }
  // Room under the last row to drop into.
  const rows = Math.max(rowsUsed(placed), dropCell ? dropCell.row + SIZE_CELLS[drag?.size ?? "S"].rows - 1 : 0, 2) + 2;

  /** The widget under the pointer while it is dragged: lifted, tilted, at the page's zoom (E14, E15). */
  const draggedWidget = drag && available.find((w) => w.id === drag.id);
  const ghost =
    drag && draggedWidget ? (
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-50"
        style={{ transform: `translate(${drag.x - drag.grabX * zoom}px, ${drag.y - drag.grabY * zoom}px)` }}
      >
        <div
          style={{ width: pixelsOf(drag.size, column).w, height: pixelsOf(drag.size, column).h, zoom }}
          className={cn("rotate-2 rounded-widget shadow-drag", drag.from === "page" && "outline-[3px] outline-accent outline-solid")}
        >
          <Inert widget={draggedWidget} size={drag.size} />
        </div>
      </div>
    ) : null;

  // The band ends part-way down the zoomed first row, never on a widget's edge (E3): 189 + 198 × zoom.
  const bandHeight = Math.round(189 + 198 * zoom);

  return (
    <div
      ref={root}
      className={cn(
        "relative -mx-(--page-padding-narrow) -mt-(--page-padding-narrow) min-h-dvh xl:-mx-(--page-padding) xl:-mt-(--page-padding)",
        dragging && "cursor-grabbing select-none",
      )}
      style={{ paddingRight: PANEL }}
    >
      <HomeBand style={header} height={bandHeight} />
      <div className="relative flex flex-col gap-10 pt-10 pr-10" style={{ paddingLeft: HOME_PADDING }}>
        <div ref={barRef} className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-6">
            <div className="flex flex-col gap-0.5">
              <h1 className={cn("text-page-title", colour ? "on-band" : "text-primary")}>{t("edit.title")}</h1>
              <p className={cn("text-label font-normal", colour ? "on-band-tint" : "text-tertiary")}>{t("edit.line")}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              {/* Cancel — an exception to the secondary button: transparent, 38 high (E5). */}
              <button
                type="button"
                onClick={cancel}
                className={cn(
                  "inline-flex h-[38px] items-center rounded-control border bg-transparent px-3.5 text-body font-medium transition-colors",
                  colour ? "band-outline on-band hover:bg-(--on-accent)/10" : "border-field text-primary hover:border-strong",
                )}
              >
                {t("edit.cancel")}
              </button>
              <Button
                type="button"
                loading={save.isPending}
                onClick={doSave}
                className={cn("px-4", colour && "bg-card text-primary hover:bg-subtle")}
              >
                {save.isPending ? t("edit.saving") : t("edit.save")}
              </Button>
            </div>
          </div>
          <div className={cn("flex items-center justify-between gap-4 border-t pt-3", colour ? "band-divider" : "border-divider")}>
            <span className="flex items-center gap-2.5">
              <span className={cn("text-hint leading-5 font-medium", colour ? "on-band" : "text-primary")}>{t("edit.header")}</span>
              <SegmentedControl<HomeHeaderStyle>
                aria-label={t("edit.header")}
                value={header}
                onChange={setHeader}
                fill={false}
                size="sm"
                tone={colour ? "band" : "divider"}
                options={[
                  { value: "COLOUR", label: t("edit.colour") },
                  { value: "LIGHT", label: t("edit.light") },
                ]}
              />
            </span>
            {/* Reset — a plain text link, no button box (E6). */}
            <button
              type="button"
              onClick={reset}
              className={cn("text-label leading-5 underline-offset-4 hover:underline", colour ? "on-band" : "text-primary")}
            >
              {t("edit.reset")}
            </button>
          </div>
        </div>

        {/* Home at its own width, zoomed to the bar's (E2, E3); a container, so it is four columns as on Home. */}
        <div style={{ width: homeWidth, zoom }} className="@container pb-24">
          <WidgetGrid ref={grid} style={{ gridTemplateRows: `repeat(${rows}, ${ROW}px)` }}>
            {cells}
          </WidgetGrid>
        </div>
      </div>

      <aside
        aria-label={t("edit.panelTitle")}
        className="fixed inset-y-0 right-0 z-30 flex w-[480px] flex-col gap-3 border-l border-divider bg-card p-6 shadow-dialog"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-section-title text-primary">{t("edit.panelTitle")}</h2>
          <Button type="button" variant="ghost" size="icon-sm" aria-label={t("edit.close")} onClick={cancel}>
            <Icon icon={Cancel01Icon} size="sm" />
          </Button>
        </div>
        <PanelSearch value={search} onChange={setSearch} placeholder={t("edit.search")} clearLabel={t("edit.clearSearch")} />
        {!term && (
          <div className="flex flex-wrap gap-2">
            {chip("ALL", t("edit.all"), available.length, category === "ALL", () => setCategory("ALL"))}
            {HOME_CATEGORIES.map((c) => chip(c, t(HOME_CATEGORY_LABEL_KEYS[c]), counts[c], category === c, () => setCategory(c)))}
          </div>
        )}
        {!term && <p className="text-hint leading-5 text-tertiary">{t("edit.hint")}</p>}
        {term && found.length > 0 && <p className="text-label font-semibold text-secondary">{t("edit.found", { count: found.length })}</p>}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {term && found.length === 0 ? (
            // E13: centred in the list's area.
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
              <Illustration scene="no-results-s" size="s" />
              <p className="text-card-title text-primary">{t("edit.noResultsTitle", { text: search.trim() })}</p>
              <p className="text-label font-normal text-secondary">{t("edit.noResultsLine")}</p>
              <Button type="button" variant="secondary" size="md" className="mt-1" onClick={() => setSearch("")}>
                {t("edit.clearSearch")}
              </Button>
            </div>
          ) : !term && category === "ALL" ? (
            HOME_CATEGORIES.map((c) => (
              <section key={c} className="flex flex-col">
                <h3 className="pt-3 text-hint font-semibold text-tertiary">{t(HOME_CATEGORY_LABEL_KEYS[c])}</h3>
                <ul className="flex flex-col divide-y divide-divider">{available.filter((w) => w.category === c).map(row)}</ul>
              </section>
            ))
          ) : (
            <ul className="flex flex-col divide-y divide-divider">{listed.map(row)}</ul>
          )}
        </div>
      </aside>

      {ghost}

      <ConfirmCancelModal
        isOpen={confirming}
        title={t("edit.discardTitle")}
        description={t("edit.discardLine")}
        cancelText={t("edit.keepEditing")}
        confirmText={t("edit.discard")}
        onCancelAction={() => setConfirming(false)}
        onConfirmAction={() => {
          setConfirming(false);
          close();
        }}
      />
    </div>
  );
};
