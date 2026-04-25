"use client";

import { TableCell, TableRow } from "@/public/desact/src/components/ui/table";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";

export default function AssignedUsersTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={`assigned-users-skel-${i}`} className="border-brown-200">
          <TableCell className="py-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full"/>
              <div className="space-y-2">
                <Skeleton className="h-4 w-40"/>
                <Skeleton className="h-3 w-24"/>
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-40"/>
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="h-8 w-8 rounded-md ml-auto"/>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
