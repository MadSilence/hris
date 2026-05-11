"use client";

import { FC } from "react";
import Link from "next/link";
import { Archive, CalendarDays, Copy, DownloadCloud, FilePlus2, MoreHorizontal, Search, Trash2, } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Card, CardContent } from "@/public/desact/src/components/ui/card";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Input } from "@/public/desact/src/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/public/desact/src/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/public/desact/src/components/ui/table";

import type { PublicHolidayCalendarListItem } from "../PublicHolidaysSettingsContainer";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";

type Props = {
  calendars: PublicHolidayCalendarListItem[];
};

export const PublicHolidaysSettingsComponent: FC<Props> = ({ calendars }) => {
  const activeCount = calendars.filter((item) => item.status === "ACTIVE").length;

  const assignedCount = calendars.filter(
    (item) => item.assignmentsSummary !== "No assignments",
  ).length;

  return (
    <div className="min-h-svh bg-[var(--color-bg-primary)] p-4">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <SettingsPageHeader title="Public holidays" backHref="/settings"/>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-2xl bg-brown-50 p-3">
                <CalendarDays className="h-5 w-5 text-[var(--color-text-primary)]"/>
              </div>

              <div>
                <p className="text-2xl font-semibold">{calendars.length}</p>
                <p className="text-sm text-[var(--color-text-tertiary)]">
                  Calendars
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-2xl bg-brown-50 p-3">
                <Archive className="h-5 w-5 text-[var(--color-text-primary)]"/>
              </div>

              <div>
                <p className="text-2xl font-semibold">{activeCount}</p>
                <p className="text-sm text-[var(--color-text-tertiary)]">
                  Active
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-2xl bg-brown-50 p-3">
                <Copy className="h-5 w-5 text-[var(--color-text-primary)]"/>
              </div>

              <div>
                <p className="text-2xl font-semibold">{assignedCount}</p>
                <p className="text-sm text-[var(--color-text-tertiary)]">
                  Assigned calendars
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <CardContent className="flex flex-col gap-4 px-0 py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between py-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Holiday calendars
              </h2>

              <p className="text-sm text-[var(--color-text-tertiary)]">
                Manage public holiday calendars and assign them to employees,
                locations or groups.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]"/>

                <Input
                  className="pl-9"
                  placeholder="Search calendars..."
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>
                    <FilePlus2 className="mr-2 h-4 w-4"/>
                    Add calendar
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <FilePlus2 className="mr-2 h-4 w-4"/>
                    Create manually
                  </DropdownMenuItem>

                  <DropdownMenuItem>
                    <DownloadCloud className="mr-2 h-4 w-4"/>
                    Choose from Google
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Calendar</TableHead>
                  <TableHead>Country / Region</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Holidays</TableHead>
                  <TableHead>Assigned to</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="w-12"/>
                </TableRow>
              </TableHeader>

              <TableBody>
                {calendars.map((calendar) => (
                  <TableRow key={calendar.id}>
                    <TableCell>
                      <Link
                        href={`/settings/public-holidays/${calendar.id}`}
                        className="font-medium text-[var(--color-text-primary)] no-underline"
                      >
                        {calendar.name}
                      </Link>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        <p>{calendar.country}</p>

                        {calendar.region ? (
                          <p className="text-[var(--color-text-tertiary)]">
                            {calendar.region}
                          </p>
                        ) : null}
                      </div>
                    </TableCell>

                    <TableCell>{calendar.year}</TableCell>

                    <TableCell>{calendar.holidaysCount}</TableCell>

                    <TableCell>{calendar.assignmentsSummary}</TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          calendar.status === "ACTIVE"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {calendar.status}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline">{calendar.source}</Badge>
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Calendar actions"
                          >
                            <MoreHorizontal className="h-4 w-4"/>
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/settings/time/public-holidays/${calendar.id}`}
                            >
                              Open
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4"/>
                            Duplicate
                          </DropdownMenuItem>

                          <DropdownMenuItem>
                            <Archive className="mr-2 h-4 w-4"/>
                            Archive
                          </DropdownMenuItem>

                          <DropdownMenuSeparator/>

                          <DropdownMenuItem variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4"/>
                            Delete with disclaimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </div>
    </div>
  );
};
