"use client";

import * as React from "react";
import { TableCell, TableRow } from "@/components/desact/table";
import { Skeleton } from "@/components/desact/skeleton";

export default function UsersRolesTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={`users-skel-${i}`} className="border-divider">
          <TableCell className="py-2">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-7 w-7 rounded-pill"/>
              <Skeleton className="h-4 w-32"/>
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24"/>
          </TableCell>
          <TableCell>
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-20 rounded-pill"/>
              <Skeleton className="h-5 w-16 rounded-pill"/>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
