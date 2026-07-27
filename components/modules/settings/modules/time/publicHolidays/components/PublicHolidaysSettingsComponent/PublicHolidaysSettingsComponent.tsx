"use client";

import { FC, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, CalendarDays, Copy, DownloadCloud, FilePlus2, MoreHorizontal, Search, Trash2 } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { CardContent } from "@/public/desact/src/components/ui/card";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Input } from "@/public/desact/src/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/public/desact/src/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/public/desact/src/components/ui/table";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { PublicHolidaysSettingsSkeleton } from "@/components/modules/settings/modules/time/publicHolidays/components/PublicHolidaysSettingsSkeleton";
import { PublicHolidayCalendarStatus } from "@/api/modules/publicHolidays/calendars/dto";
import { PublicHolidayCalendar } from "@/models/publicHolidays/calendar";
import { ChoosePublicHolidayTemplateModal } from "@/components/modules/settings/modules/time/publicHolidays/components/modals/ChoosePublicHolidayTemplateModal";

type Props = {
  calendars: PublicHolidayCalendar[];
  isLoading: boolean;
};

const getStatusBadgeClassName = (status: PublicHolidayCalendarStatus) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800 border-green-200";
    case "DRAFT":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "ARCHIVED":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const formatCountryRegion = (calendar: PublicHolidayCalendar) => {
  const country = calendar.sourceCountryCode;
  const region = calendar.sourceRegionCode;
  if (country && region) return `${country} / ${region}`;
  if (country) return country;
  if (region) return region;
  return "—";
};

export const PublicHolidaysSettingsComponent: FC<Props> = ({ calendars, isLoading }) => {
  const router = useRouter();
  const [isChooseTemplateModalOpen, setIsChooseTemplateModalOpen] = useState(false);

  const hasCalendars = calendars.length > 0;

  const handleCreateManually = () => {
    router.push("/settings/time/public-holidays/new");
  };

  return (
    <>
      <div className="min-h-svh bg-[var(--color-bg-primary)] p-4">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <SettingsPageHeader title="Public holidays" backHref="/settings" />

          <CardContent className="flex flex-col gap-4 px-0 py-5">
            <div className="flex flex-col gap-4 py-3 md:flex-row md:items-end md:justify-between">
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
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                  <Input className="pl-9" placeholder="Search calendars..." />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button>
                      <FilePlus2 className="mr-2 h-4 w-4" />
                      Add calendar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={handleCreateManually}>
                      <FilePlus2 className="mr-2 h-4 w-4" />
                      Create manually
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setIsChooseTemplateModalOpen(true)}>
                      <DownloadCloud className="mr-2 h-4 w-4" />
                      Choose from template
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {isLoading ? (
              <PublicHolidaysSettingsSkeleton />
            ) : hasCalendars ? (
              <div className="overflow-hidden rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Calendar</TableHead>
                      <TableHead>Country / Region</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calendars.map((calendar) => (
                      <TableRow key={calendar.id}>
                        <TableCell>
                          <Link
                            href={`/settings/time/public-holidays/${calendar.id}`}
                            className="font-medium text-[var(--color-text-primary)] no-underline"
                          >
                            {calendar.name}
                          </Link>
                        </TableCell>
                        <TableCell>{formatCountryRegion(calendar)}</TableCell>
                        <TableCell>{calendar.year}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusBadgeClassName(calendar.status)}
                          >
                            {calendar.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label="Calendar actions">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/settings/time/public-holidays/${calendar.id}`}>
                                  Open
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
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
            ) : (
              <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center">
                <div className="mb-4 rounded-2xl bg-brown-50 p-4">
                  <CalendarDays className="h-7 w-7 text-[var(--color-text-primary)]" />
                </div>
                <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                  No public holiday calendars yet
                </h3>
                <p className="mt-2 max-w-md text-sm text-[var(--color-text-tertiary)]">
                  Create a manual calendar or choose a template to start using
                  public holidays in time off calculations.
                </p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="mt-5">
                      <FilePlus2 className="mr-2 h-4 w-4" />
                      Add calendar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center">
                    <DropdownMenuItem onSelect={handleCreateManually}>
                      <FilePlus2 className="mr-2 h-4 w-4" />
                      Create manually
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setIsChooseTemplateModalOpen(true)}>
                      <DownloadCloud className="mr-2 h-4 w-4" />
                      Choose from template
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </CardContent>
        </div>
      </div>

      <ChoosePublicHolidayTemplateModal
        isOpen={isChooseTemplateModalOpen}
        onRequestCloseAction={() => setIsChooseTemplateModalOpen(false)}
      />
    </>
  );
};
