"use client";

import * as React from "react";

/**
 * One renderer for every entity's diff.
 *
 * <p>This is what the uniform `{ field: { old, new } }` shape was for. The journal had four ways of
 * saying "what changed" — a structural diff, a pair of loose keys, a single key, and a list of field
 * names as one string — and three of them could not be drawn at all: `changedFields: "name,code"`
 * says what was touched and never what it became. They are one shape now, and this draws it.
 *
 * <p>A value that is missing on one side is a real answer, not a gap: added on the left, cleared on
 * the right. It renders as an em dash rather than an empty cell so that the two cannot be confused.
 */
export const ChangesDiff: React.FC<{ changes: Record<string, unknown> }> = ({ changes }) => {
  const entries = Object.entries(changes);
  if (entries.length === 0) return null;

  return (
    <dl className="grid grid-cols-[minmax(8rem,auto)_1fr] gap-x-4 gap-y-1 text-sm">
      {entries.map(([field, value]) => {
        const pair = (value ?? {}) as { old?: unknown; new?: unknown };
        return (
          <React.Fragment key={field}>
            <dt className="truncate font-medium text-muted-foreground">{humanise(field)}</dt>
            <dd className="flex min-w-0 flex-wrap items-center gap-2">
              <Value value={pair.old} muted/>
              <span aria-hidden className="text-muted-foreground">→</span>
              <Value value={pair.new}/>
            </dd>
          </React.Fragment>
        );
      })}
    </dl>
  );
};

const Value: React.FC<{ value: unknown; muted?: boolean }> = ({ value, muted }) => {
  const empty = value === null || value === undefined || value === "";
  const text = empty ? "—" : typeof value === "object" ? JSON.stringify(value) : String(value);

  return (
    <span
      className={[
        "max-w-full truncate rounded px-1.5 py-0.5",
        muted ? "bg-muted text-muted-foreground line-through decoration-muted-foreground/40" : "bg-muted/60 text-foreground",
        empty ? "italic" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      title={text}
    >
      {text}
    </span>
  );
};

/** `leadId` → `Lead id`. The keys are field names written by developers; this is the cheap half of making them readable. */
const humanise = (field: string): string => {
  const spaced = field
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_.]/g, " ")
    .toLowerCase()
    .trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};
