import type { EventCondition } from "@/models/automations";

/**
 * The "Only when" of a time-off or process trigger, in the shape the builder edits, and its mapping to the backend's
 * `EventCondition` tree (hris-api `EventConditions`: `ALL | ANY | NOT | MATCH`, ops `eq neq gt gte lt lte in`, `in`
 * a comma-separated list). The builder draws one group with its And / Or and, inside it, groups one level deep
 * (dashed) — "a and (b or c)". A `NOT` over one comparison is read as the opposite comparison; deeper nesting than the
 * builder draws is flattened into its group. Pure: no React.
 */
export type EventOp = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in";
export type Joiner = "AND" | "OR";

export type EventLeaf = { kind: "leaf"; id: number; field: string; op: EventOp | null; value: string };
export type EventGroup = { kind: "group"; id: number; joiner: Joiner; items: EventItem[] };
export type EventItem = EventLeaf | EventGroup;

let seq = 1;
const nextId = () => seq++;

export const blankLeaf = (): EventLeaf => ({ kind: "leaf", id: nextId(), field: "", op: null, value: "" });
export const blankGroup = (joiner: Joiner = "AND", items: EventItem[] = []): EventGroup => ({ kind: "group", id: nextId(), joiner, items });

/** What a field of an event is: `TEXT`, `NUMBER`, or the values it can take ("PREBOARDING,ONBOARDING,OFFBOARDING"). */
export const fieldKind = (type: string): { kind: "text" | "number" | "list"; values: string[] } => {
  if (type === "NUMBER") return { kind: "number", values: [] };
  if (type === "TEXT" || !type) return { kind: "text", values: [] };
  return { kind: "list", values: type.split(",").map((v) => v.trim()).filter(Boolean) };
};

export const opsFor = (type: string): EventOp[] =>
  fieldKind(type).kind === "number" ? ["gt", "gte", "lt", "lte", "eq", "neq"] : ["eq", "neq", "in"];

const OPPOSITE: Record<EventOp, EventOp | null> = { eq: "neq", neq: "eq", gt: "lte", gte: "lt", lt: "gte", lte: "gt", in: null };

const isOp = (op: string | null | undefined): op is EventOp =>
  op === "eq" || op === "neq" || op === "gt" || op === "gte" || op === "lt" || op === "lte" || op === "in";

export const leafComplete = (l: EventLeaf): boolean => Boolean(l.field && l.op && l.value.trim());

const leafOf = (c: EventCondition, negate = false): EventLeaf | null => {
  if (c.kind !== "MATCH" || !c.field || !isOp(c.op)) return null;
  const op = negate ? OPPOSITE[c.op] : c.op;
  if (!op) return null;
  return { kind: "leaf", id: nextId(), field: c.field, op, value: c.value ?? "" };
};

/** Every comparison under a node, flattened — for nesting deeper than the builder draws. */
const leavesUnder = (c: EventCondition, negate = false): EventLeaf[] => {
  if (c.kind === "MATCH") {
    const l = leafOf(c, negate);
    return l ? [l] : [];
  }
  if (c.kind === "NOT") return (c.children ?? []).flatMap((ch) => leavesUnder(ch, !negate));
  return (c.children ?? []).flatMap((ch) => leavesUnder(ch, negate));
};

const itemOf = (c: EventCondition, depth: number): EventItem[] => {
  if (c.kind === "MATCH") {
    const l = leafOf(c);
    return l ? [l] : [];
  }
  if (c.kind === "NOT") {
    const only = c.children?.length === 1 ? c.children[0] : null;
    const l = only ? leafOf(only, true) : null;
    return l ? [l] : leavesUnder(c);
  }
  const joiner: Joiner = c.kind === "ANY" ? "OR" : "AND";
  if (depth >= 1) return [blankGroup(joiner, (c.children ?? []).flatMap((ch) => leavesUnder(ch)))];
  return [blankGroup(joiner, (c.children ?? []).flatMap((ch) => itemOf(ch, depth + 1)))];
};

/** The builder's root group for a stored tree; an empty AND group for none. */
export const fromTree = (tree: EventCondition | null | undefined): EventGroup => {
  if (!tree || !tree.kind) return blankGroup("AND");
  if (tree.kind === "ALL" || tree.kind === "ANY") {
    return blankGroup(tree.kind === "ANY" ? "OR" : "AND", (tree.children ?? []).flatMap((ch) => itemOf(ch, 1)));
  }
  return blankGroup("AND", itemOf(tree, 1));
};

const nodeOf = (item: EventItem): EventCondition | null => {
  if (item.kind === "leaf") {
    return leafComplete(item) ? { kind: "MATCH", field: item.field, op: item.op, value: item.value.trim() } : null;
  }
  const children = item.items.map(nodeOf).filter((n): n is EventCondition => n !== null);
  if (children.length === 0) return null;
  return { kind: item.joiner === "OR" ? "ANY" : "ALL", children };
};

/** The tree for the backend; null when no condition is complete — "no condition" is "always". */
export const toTree = (root: EventGroup): EventCondition | null => nodeOf(root);

/** The comparisons of a tree, for words ("Days more than 10"). */
export const comparisons = (tree: EventCondition | null | undefined): EventLeaf[] => (tree ? leavesUnder(tree) : []);
