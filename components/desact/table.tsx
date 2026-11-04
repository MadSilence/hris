"use client";

import * as React from "react";

import { cn } from "@/lib/cn";

/*
 * Tables (SPEC § 13.5). Rows are flat and separated by hairlines, never striped; the header is 36 px with
 * 12/16 medium tertiary column names in sentence case; rows are 44 px, `compact` makes them 36. Hover is the
 * row-hover surface, a selected row (`data-state="selected"`) the accent's subtle tint. Numbers are tabular
 * (the base layer sets it on every table) and right-aligned by the caller.
 *
 * The container card (border, micro-shadow, radius 16) belongs to the list that owns the table, so the same
 * table can sit inside a card, a dialog or a side panel.
 *
 * `stickyHeader`: the list scrolls inside its own container and its header should stay put. The wrapper's
 * `overflow-x-auto` would make the wrapper itself the scrollport a `sticky top-0` header attaches to — a box
 * that never scrolls vertically. With the flag the wrapper does not clip, and the list's own scroller
 * carries both axes.
 */
function Table({
  className,
  stickyHeader = false,
  compact = false,
  ...props
}: React.ComponentProps<"table"> & { stickyHeader?: boolean; compact?: boolean }) {
  return (
    <div data-slot="table-container" className={stickyHeader ? "relative w-full" : "relative w-full overflow-x-auto"}>
      <table
        data-slot="table"
        data-density={compact ? "compact" : undefined}
        className={cn("group/table w-full caption-bottom text-body", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={cn("[&_tr]:border-b [&_tr]:border-divider", className)} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("border-t border-divider bg-subtle font-medium [&>tr]:last:border-b-0", className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-divider transition-colors duration-(--duration-hover)",
        "hover:bg-row-hover data-[state=selected]:bg-accent-subtle",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-9 px-3 text-left align-middle text-hint font-medium whitespace-nowrap text-tertiary",
        "[&:has([role=checkbox])]:w-10 [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "h-11 px-3 align-middle whitespace-nowrap group-data-[density=compact]/table:h-9",
        "[&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return <caption data-slot="table-caption" className={cn("mt-4 text-hint text-tertiary", className)} {...props} />;
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
