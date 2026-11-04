"use client";

import { TableCell, TableRow } from "@/components/desact/table";
import { Skeleton } from "@/components/desact/skeleton";

export default function AssignedUsersTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={`assigned-users-skel-${i}`} className="border-divider">
          <TableCell className="py-2">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-7 w-7 rounded-pill"/>
              <Skeleton className="h-4 w-40"/>
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28"/>
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-16 rounded-pill"/>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24"/>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28"/>
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="h-8 w-8 rounded-control ml-auto"/>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
