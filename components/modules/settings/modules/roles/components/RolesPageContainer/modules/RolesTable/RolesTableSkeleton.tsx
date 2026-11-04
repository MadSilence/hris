"use client";

import * as React from "react";
import { TableCell, TableRow } from "@/components/desact/table";
import { Skeleton } from "@/components/desact/skeleton";

export default function RolesTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={`roles-skel-${i}`} className="border-divider">
          <TableCell className="py-3">
            <Skeleton className="h-4 w-40"/>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-8"/>
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-16 rounded-pill"/>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24"/>
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-8 rounded-control ml-auto"/>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
