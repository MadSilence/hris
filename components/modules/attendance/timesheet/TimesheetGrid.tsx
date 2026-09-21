"use client";

import React from "react";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/public/desact/src/components/ui/table";
import type { AttendanceMonth } from "@/models/attendance";
import { TimesheetDayRow, type SaveDayResult } from "./TimesheetDayRow";

type Props = {
  month: AttendanceMonth | undefined;
  isLoading: boolean;
  canRecord: boolean;
  onSave: (date: string, hours: number, description: string) => Promise<SaveDayResult>;
};

/** The month as a table, one row per day. The skeleton is rows inside the real body, under the real header. */
export const TimesheetGrid: React.FC<Props> = ({ month, isLoading, canRecord, onSave }) => (
  <div className="rounded-lg border border-brown-200 bg-white">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Day</TableHead>
          <TableHead>Expected</TableHead>
          <TableHead>Hours</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right"><span className="sr-only">Actions</span></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading || !month
          ? Array.from({ length: 8 }, (_, index) => (
            <TableRow key={index}>
              <TableCell><Skeleton className="h-4 w-14"/></TableCell>
              <TableCell><Skeleton className="h-4 w-20"/></TableCell>
              <TableCell><Skeleton className="h-4 w-12"/></TableCell>
              <TableCell><Skeleton className="h-4 w-64"/></TableCell>
              <TableCell/>
            </TableRow>
          ))
          : month.days.map((day) => (
            <TimesheetDayRow
              key={`${month.userId}-${day.date}`}
              day={day}
              today={month.today}
              canRecord={canRecord}
              onSave={onSave}
            />
          ))}
      </TableBody>
    </Table>
  </div>
);
