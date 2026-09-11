import * as React from "react";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/public/desact/src/components/ui/table";

/**
 * The offices table, waiting.
 *
 * **Same six columns, same widths, same header, same row height.** It used to be five bars at
 * `1.2fr 0.8fr 2fr 1.2fr 1fr` rendered *instead of* the table, so the header appeared out of
 * nowhere and every column moved when the rows landed — the exact defect
 * `technical_documentation/ui/TABLES_AND_LISTS.md` § 2 names.
 *
 * A skeleton is a promise about what is coming; this one keeps it.
 */
export const OfficeSettingsSkeleton: React.FC<{ rows?: number }> = ({ rows = 6 }) => (
  <Table className="table-fixed">
    <TableHeader className="[&_tr]:border-brown-200 [&_tr]:border-t-0">
      <TableRow>
        <TableHead className="w-[22%]">Name</TableHead>
        <TableHead className="w-[13%]">Country</TableHead>
        <TableHead className="w-[13%]">Assigned Users</TableHead>
        <TableHead className="w-[27%]">Address</TableHead>
        <TableHead className="w-[12.5%]">Email</TableHead>
        <TableHead className="w-[12.5%]">Phone</TableHead>
      </TableRow>
    </TableHeader>

    <TableBody>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i} className="border-brown-200 hover:bg-transparent [&_td]:py-2">
          <TableCell className="py-3"><Skeleton className="h-4 w-3/4"/></TableCell>
          <TableCell className="py-3"><Skeleton className="h-4 w-2/3"/></TableCell>
          <TableCell className="py-3"><Skeleton className="h-4 w-1/3"/></TableCell>
          <TableCell className="py-3"><Skeleton className="h-4 w-5/6"/></TableCell>
          <TableCell className="py-3"><Skeleton className="h-4 w-3/4"/></TableCell>
          <TableCell className="py-3"><Skeleton className="h-4 w-2/3"/></TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
