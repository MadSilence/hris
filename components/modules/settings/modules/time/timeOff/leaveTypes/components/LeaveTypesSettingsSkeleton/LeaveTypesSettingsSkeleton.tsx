"use client";

import { FC } from "react";
import { TableCell, TableRow } from "@/components/desact/table";

const ROWS = 5;

export const LeaveTypesSettingsSkeleton: FC = () => {
  return (
    <>
      {Array.from({ length: ROWS }).map((_, i) => (
        <TableRow key={i} className="border-divider [&_td]:py-3">
          <TableCell className="pl-4">
            <div className="h-4 w-40 shimmer rounded-tag bg-mist" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-24 shimmer rounded-tag bg-mist" />
          </TableCell>
          <TableCell>
            <div className="h-5 w-16 shimmer rounded-tag bg-mist" />
          </TableCell>
          <TableCell className="w-12" />
        </TableRow>
      ))}
    </>
  );
};
