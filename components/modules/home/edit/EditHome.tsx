"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  Add01Icon,
  Cancel01Icon,
  Delete02Icon,
  DragDropVerticalIcon,
  MinusSignIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/desact/popover";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal";
import { FilterChip } from "@/components/ui/FilterChip";
import { SearchField } from "@/components/ui/SearchField";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { EmptyState } from "@/components/feedback/EmptyState";
import { cn } from "@/lib/cn";
import type { HomeHeaderStyle, HomeWidgetPlacement, HomeWidgetSize } from "@/models/home";
import {
  HOME_CATEGORIES,
  HOME_CATEGORY_LABEL_KEYS,
  addAt,
  defaultHome,
  moveTo,
  removeWidget,
  resizeWidget,
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
type Dragging = { id: string; size: HomeWidgetSize; from: "page" | "panel" } | null;

/** A widget's true footprint in pixels, for drawing it whole and scaling it down. */
const PIXELS: Record<HomeWidgetSize, { w: number; h: number }> = { S: { w: 254, h: 160 }, M: { w: 254, h: 344 }, L: { w: 532, h: 344 } };
/** The panel's preview box: 156 × 132 on Mist, the widget scaled to fit 140 × 116. */
const PREVIEW = { w: 140, h: 116 };

/** The sizes a widget comes in, as a pill segmented control 28 high (`home-edit` → Values). */
const SizeSwitch: React.FC<{
  widget: HomeWidgetDefinition;
  value: HomeWidgetSize;
  onChange: (size: HomeWidgetSize) => void;
}> = ({ widget, value, onChange }) => {
  const t = useTranslations("home");
  if (widget.sizes.length === 1) return <span className="text-hint text-tertiary">{t("sizes.smallOnly")}</span>;
  return (
    <SegmentedControl<HomeWidgetSize>
      aria-label={t("sizes.label", { size: t(`sizes.${value}`) })}
      value={value}
      onChange={onChange}
      fill={false}
      className="h-7 rounded-pill p-0.5 [&_button]:h-6 [&_button]:rounded-pill [&_button]:text-hint"
      options={widget.sizes.map((size) => ({ value: size, label: t(`sizes.${size}`) }))}
    />
  );
};

/** A widget drawn at its true size and scaled to fit a box — the panel's preview, with the person's real data. */
const ScaledWidget: React.FC<{ widget: HomeWidgetDefinition; size: HomeWidgetSize }> = ({ widget, size }) => {
  const { w, h } = PIXELS[size];
  const scale = Math.min(PREVIEW.w / w, PREVIEW.h / h);
  return (
    <span className="pointer-events-none flex h-[132px] w-[156px] shrink-0 items-center justify-center overflow-hidden rounded-tint bg-mist" aria-hidden>
      <span style={{ width: w, height: h, zoom: scale }} className="block">
        <widget.Component size={size} preview />
      </span>
    </span>
  );
};

/** One row of the widgets panel: preview, name, description, sizes, and + or "On your home". */
const CatalogRow: React.FC<{
  widget: HomeWidgetDefinition;
  onHome: boolean;
  size: HomeWidgetSize;
  match: string;
  onSize: (size: HomeWidgetSize) => void;
  onAdd: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}> = ({ widget, onHome, size, match, onSize, onAdd, onDragStart, onDragEnd }) => {
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
    <li
      draggable={!onHome}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "copy";
        event.dataTransfer.setData("text/plain", widget.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      className={cn("group flex items-center gap-4 rounded-tint px-2 py-3", !onHome && "cursor-grab hover:bg-mist")}
    >
      <ScaledWidget widget={widget} size={size} />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="line-clamp-2 text-card-title text-primary">{mark(name)}</p>
        <p className="line-clamp-2 text-label text-secondary">{mark(t(widget.descriptionKey))}</p>
        <SizeSwitch widget={widget} value={size} onChange={onSize} />
      </div>
      {onHome ? (
        <span className="shrink-0 text-label text-tertiary">{t("edit.onYourHome")}</span>
      ) : (
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          aria-label={t("edit.add", { name })}
          className="shrink-0 group-hover:border-accent group-hover:text-accent-text"
          onClick={onAdd}
        >
          <Icon icon={Add01Icon} size="sm" />
        </Button>
      )}
    </li>
  );
};

/**
 * Edit home (`home-edit`): the page zoomed out beside the widgets panel. Add, drag, resize, remove, the header and
 * Reset — and nothing changes until Save. Undo in a toast for add, remove and reset; Cancel confirms only when there
 * are changes. The catalogue is the screen's own, so the panel has no loading or error of its own to show.
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
  const [dragging, setDragging] = useState<Dragging>(null);
  const [dropAt, setDropAt] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<HomeCategory | "ALL">("FOR_ME");
  const [rowSizes, setRowSizes] = useState<Record<string, HomeWidgetSize>>({});

  const changed = header !== startHeader || !sameHome(placed, start);
  const onHome = new Set(placed.map((p) => p.widget.id));
  const sizeFor = (widget: HomeWidgetDefinition) => rowSizes[widget.id] ?? widget.defaultSize;

  /** A change that a toast can take back: the page before it comes back on Undo. */
  const undoable = (next: Placed[], message: string) => {
    const before = placed;
    setPlaced(next);
    toast.success(message, { action: { label: t("card.undo"), onClick: () => setPlaced(before) } });
  };

  /**
   * "+" adds at the end of the order: the dense grid then puts the widget in the first free place it fits, which is
   * what the spec asks for; a drop puts it where the drop place was.
   */
  const add = (widget: HomeWidgetDefinition, size: HomeWidgetSize, index?: number) => {
    undoable(addAt(placed, widget, size, index), t("edit.toasts.added", { name: t(widget.titleKey) }));
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
    toast.success(t("edit.toasts.reset"), {
      action: {
        label: t("card.undo"),
        onClick: () => {
          setPlaced(before.placed);
          setHeader(before.header);
        },
      },
    });
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
          toast.success(t("edit.toasts.saved"));
          onClose();
        },
        onError: () => {
          toast.error(t("edit.toasts.saveFailed"), { action: { label: t("edit.toasts.retry"), onClick: doSave } });
        },
      },
    );
  };

  const cancel = () => (changed ? setConfirming(true) : onClose());

  const drop = () => {
    if (!dragging || dropAt === null) return;
    if (dragging.from === "page") {
      setPlaced(moveTo(placed, dragging.id, dropAt > placed.findIndex((p) => p.widget.id === dragging.id) ? dropAt - 1 : dropAt));
    } else {
      const widget = available.find((w) => w.id === dragging.id);
      if (widget) add(widget, dragging.size, dropAt);
    }
    setDragging(null);
    setDropAt(null);
  };

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
      onSize={(size) => setRowSizes((current) => ({ ...current, [widget.id]: size }))}
      onAdd={() => add(widget, sizeFor(widget))}
      onDragStart={() => setDragging({ id: widget.id, size: sizeFor(widget), from: "panel" })}
      onDragEnd={() => {
        setDragging(null);
        setDropAt(null);
      }}
    />
  );

  const placeholder = dragging && dropAt !== null && (
    <WidgetCell key="drop-place" size={dragging.size} className="rounded-widget border-2 border-dashed border-accent-ring bg-accent-subtle" />
  );

  const cells: React.ReactNode[] = [];
  placed.forEach((entry, index) => {
    if (dropAt === index) cells.push(placeholder);
    const widget = entry.widget;
    const name = t(widget.titleKey);
    const isSelected = selected === widget.id;
    cells.push(
      <WidgetCell
        key={widget.id}
        size={entry.size}
        data-just-added={justAdded === widget.id ? "true" : undefined}
        className={cn(
          "relative rounded-widget transition-transform duration-(--duration-reorder)",
          isSelected ? "-translate-y-2 shadow-drag ring-[3px] ring-accent" : "ring-[1.5px] ring-accent/25 hover:ring-2",
          dragging?.id === widget.id && "opacity-40",
        )}
        onDragOver={(event) => {
          if (!dragging) return;
          event.preventDefault();
          const box = event.currentTarget.getBoundingClientRect();
          const after = event.clientX > box.left + box.width / 2 || event.clientY > box.top + box.height * 0.75;
          setDropAt(after ? index + 1 : index);
        }}
        onDrop={(event) => {
          event.preventDefault();
          drop();
        }}
      >
        <widget.Component size={entry.size} preview />
        <Popover open={isSelected} onOpenChange={(open) => setSelected(open ? widget.id : null)}>
          <PopoverAnchor asChild>
            <button
              type="button"
              draggable
              aria-label={t("edit.drag", { name })}
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", widget.id);
                setSelected(null);
                setDragging({ id: widget.id, size: entry.size, from: "page" });
              }}
              onDragEnd={() => {
                setDragging(null);
                setDropAt(null);
              }}
              onClick={() => setSelected(isSelected ? null : widget.id)}
              className="absolute inset-0 z-10 cursor-grab rounded-widget"
            />
          </PopoverAnchor>
          <PopoverContent align="center" className="flex w-auto items-center gap-2 p-2">
            <SizeSwitch widget={widget} value={entry.size} onChange={(size) => setPlaced(resizeWidget(placed, widget.id, size))} />
            {!widget.locked && (
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
      </WidgetCell>,
    );
  });
  if (dropAt === placed.length) cells.push(placeholder);

  return (
    <div className="relative -mx-(--page-padding-narrow) -mt-(--page-padding-narrow) min-h-dvh pr-[480px] xl:-mx-(--page-padding) xl:-mt-(--page-padding)">
      <HomeBand style={header} />
      <div className="relative flex flex-col gap-6 px-10 pt-10 max-[1281px]:px-12">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className={cn("text-page-title", header === "COLOUR" ? "on-band" : "text-primary")}>{t("edit.title")}</h1>
              <p className={cn("text-label font-normal", header === "COLOUR" ? "on-band-quiet" : "text-secondary")}>{t("edit.line")}</p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={cancel} className={cn(header === "COLOUR" && "band-glass on-band")}>
                {t("edit.cancel")}
              </Button>
              <Button
                type="button"
                loading={save.isPending}
                loadingLabel={t("edit.saving")}
                onClick={doSave}
                className={cn(header === "COLOUR" && "bg-card text-primary hover:bg-subtle")}
              >
                {t("edit.save")}
              </Button>
            </div>
          </div>
          <div className={cn("flex items-center justify-between gap-4 border-t pt-4", header === "COLOUR" ? "border-(--on-accent)/20" : "border-divider")}>
            <span className="flex items-center gap-3">
              <span className={cn("text-label", header === "COLOUR" ? "on-band" : "text-primary")}>{t("edit.header")}</span>
              <SegmentedControl<HomeHeaderStyle>
                aria-label={t("edit.header")}
                value={header}
                onChange={setHeader}
                fill={false}
                className="h-7 rounded-pill p-0.5 [&_button]:h-6 [&_button]:rounded-pill"
                options={[
                  { value: "COLOUR", label: t("edit.colour") },
                  { value: "LIGHT", label: t("edit.light") },
                ]}
              />
            </span>
            <Button type="button" variant="ghost" onClick={reset} className={cn(header === "COLOUR" && "on-band hover:bg-transparent hover:underline")}>
              {t("edit.reset")}
            </Button>
          </div>
        </div>

        <div className="[zoom:0.56] max-[1281px]:[zoom:0.44]">
          {placed.length === 0 && !dragging ? (
            <div
              onDragOver={(event) => event.preventDefault()}
              className="flex h-[344px] w-[1088px] items-center justify-center rounded-widget border-2 border-dashed border-accent-ring bg-accent-subtle text-section-title text-accent-text"
            >
              {t("edit.dropHere")}
            </div>
          ) : (
            <div
              onDragOver={(event) => {
                if (!dragging) return;
                event.preventDefault();
                if (event.target === event.currentTarget) setDropAt(placed.length);
              }}
              onDrop={(event) => {
                event.preventDefault();
                drop();
              }}
              className="pb-24"
            >
              <WidgetGrid>{cells}</WidgetGrid>
            </div>
          )}
        </div>
      </div>

      <aside
        aria-label={t("edit.panelTitle")}
        className="fixed inset-y-0 right-0 z-30 flex w-[480px] flex-col gap-3 rounded-l-panel bg-card p-6 shadow-dialog"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-section-title text-primary">{t("edit.panelTitle")}</h2>
          <Button type="button" variant="ghost" size="icon-sm" aria-label={t("edit.close")} onClick={cancel}>
            <Icon icon={Cancel01Icon} size="sm" />
          </Button>
        </div>
        <SearchField value={search} onChange={setSearch} placeholder={t("edit.search")} />
        {!term && (
          <div className="flex flex-wrap gap-2">
            <FilterChip selected={category === "ALL"} onClick={() => setCategory("ALL")}>
              {t("edit.chip", { label: t("edit.all"), count: available.length })}
            </FilterChip>
            {HOME_CATEGORIES.map((c) => (
              <FilterChip key={c} selected={category === c} onClick={() => setCategory(c)}>
                {t("edit.chip", { label: t(HOME_CATEGORY_LABEL_KEYS[c]), count: counts[c] })}
              </FilterChip>
            ))}
          </div>
        )}
        {!term && <p className="text-label text-tertiary">{t("edit.hint")}</p>}
        {term && found.length > 0 && <p className="text-label font-semibold text-secondary">{t("edit.found", { count: found.length })}</p>}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {term && found.length === 0 ? (
            <EmptyState
              compact
              scene="no-results-s"
              title={t("edit.noResultsTitle", { text: search.trim() })}
              description={t("edit.noResultsLine")}
              action={<Button type="button" variant="secondary" size="sm" onClick={() => setSearch("")}>{t("edit.clearSearch")}</Button>}
            />
          ) : !term && category === "ALL" ? (
            HOME_CATEGORIES.map((c) => (
              <section key={c} className="flex flex-col">
                <h3 className="px-2 pt-3 text-hint font-semibold text-tertiary">{t(HOME_CATEGORY_LABEL_KEYS[c])}</h3>
                <ul className="flex flex-col divide-y divide-divider">{available.filter((w) => w.category === c).map(row)}</ul>
              </section>
            ))
          ) : (
            <ul className="flex flex-col divide-y divide-divider">{listed.map(row)}</ul>
          )}
        </div>
      </aside>

      <ConfirmCancelModal
        isOpen={confirming}
        title={t("edit.discardTitle")}
        description={t("edit.discardLine")}
        cancelText={t("edit.keepEditing")}
        confirmText={t("edit.discard")}
        onCancelAction={() => setConfirming(false)}
        onConfirmAction={() => {
          setConfirming(false);
          onClose();
        }}
      />
    </div>
  );
};
