import * as React from "react";
import { TableCell, TableRow } from "@/public/desact/src/components/ui/table";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";

export const TimeOffPoliciesSettingsSkeleton: React.FC<{ rows?: number }> = ({
  rows = 6,
}) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRow key={`top-skel-${index}`} className="border-brown-200 [&_td]:py-2">
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
            <Skeleton className="h-6 w-16 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="ml-auto h-8 w-8 rounded-md" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};
