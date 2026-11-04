import * as React from "react";
import { TableCell, TableRow } from "@/components/desact/table";
import { Skeleton } from "@/components/desact/skeleton";

export const TimeOffPoliciesSettingsSkeleton: React.FC<{ rows?: number }> = ({
  rows = 6,
}) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRow key={`top-skel-${index}`} className="border-divider [&_td]:py-2">
          <TableCell className="py-3 pl-4">
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-14" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-16 rounded-pill" />
          </TableCell>
          <TableCell>
            <Skeleton className="ml-auto h-8 w-8 rounded-control" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};
