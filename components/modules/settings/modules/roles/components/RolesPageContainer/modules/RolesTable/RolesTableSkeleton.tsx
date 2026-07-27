"use client";

import * as React from "react";
import { TableCell, TableRow } from "@/public/desact/src/components/ui/table";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";

export default function RolesTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={`roles-skel-${i}`} className="border-brown-200">
          <TableCell className="py-3">
            <Skeleton className="h-4 w-40"/>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-8"/>
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-16 rounded-full"/>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24"/>
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-8 rounded-md ml-auto"/>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
