"use client";

import * as React from "react";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/public/desact/src/components/ui/table";
import { AttributeGroup } from "@/models/attribute";

export default function AttributeGroupsTable({
  loading,
  groups,
}: {
  loading: boolean;
  groups: AttributeGroup[];
}) {
  const sorted = React.useMemo(() => {
    const arr = [...(groups ?? [])];
    arr.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    return arr;
  }, [groups]);

  const hasRows = sorted.length > 0;

  return (
    <Table>
      <TableHeader className="[&_tr]:border-brown-200">
        <TableRow>
          <TableHead>Group</TableHead>
          <TableHead className="text-right">Attributes</TableHead>
          <TableHead className="text-right">Sort</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead>Created By</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <TableRow key={`g-skel-${i}`} className="border-brown-200">
              <TableCell className="py-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-52"/>
                  <Skeleton className="h-3 w-20"/>
                </div>
              </TableCell>
              <TableCell className="text-right"><Skeleton className="h-4 w-10 ml-auto"/></TableCell>
              <TableCell className="text-right"><Skeleton className="h-4 w-10 ml-auto"/></TableCell>
              <TableCell><Skeleton className="h-4 w-28"/></TableCell>
              <TableCell><Skeleton className="h-4 w-28"/></TableCell>
            </TableRow>
          ))}

        {!loading && !hasRows && (
          <TableRow className="border-brown-200">
            <TableCell colSpan={5} className="py-3 text-sm text-muted-foreground">
              No attribute groups
            </TableCell>
          </TableRow>
        )}

        {!loading &&
          hasRows &&
          sorted.map((g) => (
            <TableRow key={g.id} className="border-brown-200 hover:bg-brown-50 [&_td]:py-2">
              <TableCell className="py-3">
                <div className="font-medium">{g.name || "—"}</div>
                {g.isSystem && (
                  <Badge variant="secondary" className="mt-1">
                    System
                  </Badge>
                )}
              </TableCell>

              <TableCell className="text-right tabular-nums">{g.attributes?.length ?? 0}</TableCell>
              <TableCell className="text-right tabular-nums">{g.sortOrder ?? 0}</TableCell>
              <TableCell className="text-muted-foreground">{formatDate(g.updatedAt)}</TableCell>
              <TableCell className="text-muted-foreground">{g.createdBy || "—"}</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}
