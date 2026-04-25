"use client";

import * as React from "react";
import { TableCell, TableRow } from "@/public/desact/src/components/ui/table";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";

export default function UsersRolesTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={`users-skel-${i}`} className="border-brown-200">
          <TableCell className="py-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full"/>
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32"/>
                <Skeleton className="h-3 w-48"/>
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-56"/>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
