"use client";

import { TableCell, TableRow } from "@/public/desact/src/components/ui/table";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";

export default function AssignedUsersTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={`assigned-users-skel-${i}`} className="border-brown-200">
          <TableCell className="py-2">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-7 w-7 rounded-full"/>
              <Skeleton className="h-4 w-40"/>
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28"/>
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-16 rounded-full"/>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24"/>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28"/>
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="h-8 w-8 rounded-md ml-auto"/>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
