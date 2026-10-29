import type { HomeWidgetPlacement } from "@/models/home";

/** The groups home is a catalogue of (sitting 2, H3), in the order they stand on the page. Entertainment is post-MVP. */
export const HOME_GROUPS = ["PERSONAL", "COMPANY", "HR", "UTILITIES"] as const;
export type HomeGroup = (typeof HOME_GROUPS)[number];

export const HOME_GROUP_LABELS: Record<HomeGroup, string> = {
  PERSONAL: "For You",
  COMPANY: "Company",
  HR: "HR",
  UTILITIES: "Utilities",
};

/** What the arrangement needs to know about a widget: its id, its group, and where it stands by default. */
export type ArrangeableWidget = { id: string; group: HomeGroup };

export type ArrangedWidget<W extends ArrangeableWidget> = { widget: W; hidden: boolean };

/**
 * The reader's home in order: the widgets they may see, as they arranged them.
 *
 * `available` is the catalogue already trimmed to what this reader may see, in its default order — a widget
 * they may not see is never offered, here or in Customize. `stored` is their own arrangement; a widget it
 * does not name (new since they arranged, or one they have just been given) takes its default place: right
 * after the widget that precedes it by default.
 */
export const arrangeHome = <W extends ArrangeableWidget>(
  available: W[],
  stored: HomeWidgetPlacement[] | null | undefined,
): ArrangedWidget<W>[] => {
  const byId = new Map(available.map((w) => [w.id, w]));
  const hidden = new Map<string, boolean>();
  const order: string[] = [];
  for (const placement of stored ?? []) {
    if (!byId.has(placement.id) || hidden.has(placement.id)) continue;
    hidden.set(placement.id, placement.hidden);
    order.push(placement.id);
  }

  available.forEach((widget, index) => {
    if (hidden.has(widget.id)) return;
    // Order matters only inside a group, so the neighbour that decides the place is one of the same group:
    // after the nearest one that precedes it by default, or else before the first one placed, or last.
    let at = -1;
    for (let j = index - 1; j >= 0 && at < 0; j--) {
      if (available[j].group !== widget.group) continue;
      const k = order.indexOf(available[j].id);
      if (k >= 0) at = k + 1;
    }
    if (at < 0) {
      const first = order.findIndex((id) => byId.get(id)?.group === widget.group);
      at = first >= 0 ? first : order.length;
    }
    order.splice(at, 0, widget.id);
    hidden.set(widget.id, false);
  });

  return order.map((id) => ({ widget: byId.get(id) as W, hidden: hidden.get(id) ?? false }));
};

/** One group's widgets, in the reader's order. */
export const widgetsOf = <W extends ArrangeableWidget>(arranged: ArrangedWidget<W>[], group: HomeGroup) =>
  arranged.filter((entry) => entry.widget.group === group);

/** Moves a widget one place up or down **within its group**; at the group's edge nothing moves. */
export const moveWidget = <W extends ArrangeableWidget>(
  arranged: ArrangedWidget<W>[],
  id: string,
  direction: "up" | "down",
): ArrangedWidget<W>[] => {
  const from = arranged.findIndex((entry) => entry.widget.id === id);
  if (from < 0) return arranged;
  const group = arranged[from].widget.group;
  const step = direction === "up" ? -1 : 1;
  let to = from + step;
  while (to >= 0 && to < arranged.length && arranged[to].widget.group !== group) to += step;
  if (to < 0 || to >= arranged.length) return arranged;

  const next = [...arranged];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
};

export const setWidgetHidden = <W extends ArrangeableWidget>(
  arranged: ArrangedWidget<W>[],
  id: string,
  hidden: boolean,
): ArrangedWidget<W>[] => arranged.map((entry) => (entry.widget.id === id ? { ...entry, hidden } : entry));

/**
 * What is saved: the whole arrangement of what the reader sees now, and — behind it — whatever they had
 * arranged for widgets they cannot see at the moment, so losing a right for a week does not lose the place.
 */
export const toPlacements = <W extends ArrangeableWidget>(
  arranged: ArrangedWidget<W>[],
  stored: HomeWidgetPlacement[] | null | undefined,
): HomeWidgetPlacement[] => {
  const shown = new Set(arranged.map((entry) => entry.widget.id));
  return [
    ...arranged.map((entry) => ({ id: entry.widget.id, hidden: entry.hidden })),
    ...(stored ?? []).filter((placement) => !shown.has(placement.id)),
  ];
};
