"use client";

import { FC } from "react";
import { TableCell, TableRow } from "@/public/desact/src/components/ui/table";

const ROWS = 5;

export const LeaveTypesSettingsSkeleton: FC = () => {
  return (
    <>
      {Array.from({ length: ROWS }).map((_, i) => (
        <TableRow key={i} className="border-brown-200 [&_td]:py-3">
          <TableCell className="pl-4">
            <div className="h-4 w-40 animate-pulse rounded bg-brown-100" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-24 animate-pulse rounded bg-brown-100" />
          </TableCell>
          <TableCell>
            <div className="h-5 w-16 animate-pulse rounded bg-brown-100" />
          </TableCell>
          <TableCell className="w-12" />
        </TableRow>
      ))}
    </>
  );
};
