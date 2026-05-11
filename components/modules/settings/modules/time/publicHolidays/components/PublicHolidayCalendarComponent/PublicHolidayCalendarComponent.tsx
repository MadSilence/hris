"use client";

import { FC } from "react";
import { CalendarPlus, Plus, Settings, Users } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/public/desact/src/components/ui/card";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { Textarea } from "@/public/desact/src/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/public/desact/src/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/public/desact/src/components/ui/table";
import type { PublicHolidayCalendarDetails } from "../PublicHolidayCalendarContainer";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";

type Props = {
  calendar: PublicHolidayCalendarDetails;
};

export const PublicHolidayCalendarComponent: FC<Props> = ({ calendar }) => {
  return (
    <div className="min-h-svh bg-[var(--color-bg-primary)] p-4">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <SettingsPageHeader title={calendar.name} backHref="/settings/time/public-holidays"/>

        <CardContent className="flex flex-col gap-3 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
                {calendar.name}
              </h1>
              <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                {calendar.country}
                {calendar.region ? ` · ${calendar.region}` : ""} · {calendar.year}
              </p>
            </div>

            <div className="flex gap-2">
              <Badge variant="secondary">{calendar.holidays.length} holidays</Badge>
              <Badge variant="outline">{calendar.assignments.length} assignments</Badge>
            </div>
          </div>

          <p className="text-sm text-[var(--color-text-tertiary)]">{calendar.description}</p>
        </CardContent>

        <Tabs defaultValue="holidays" className="flex flex-col gap-6">
          <TabsList className="w-fit">
            <TabsTrigger value="holidays">
              <CalendarPlus className="mr-2 h-4 w-4"/>
              Holidays
            </TabsTrigger>
            <TabsTrigger value="assignments">
              <Users className="mr-2 h-4 w-4"/>
              Assignments
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4"/>
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="holidays">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Holiday days</CardTitle>
              <Button>
                <Plus className="mr-2 h-4 w-4"/>
                Add holiday
              </Button>
            </CardHeader>

            <CardContent>
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Paid</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {calendar.holidays.map((holiday) => (
                      <TableRow key={holiday.id}>
                        <TableCell>{holiday.date}</TableCell>
                        <TableCell className="font-medium">{holiday.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{holiday.type}</Badge>
                        </TableCell>
                        <TableCell>{holiday.paid ? "Yes" : "No"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="assignments">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Assigned to</CardTitle>
              <Button>
                <Plus className="mr-2 h-4 w-4"/>
                Add assignment
              </Button>
            </CardHeader>

            <CardContent>
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Members</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {calendar.assignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <Badge variant="secondary">{assignment.type}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{assignment.name}</TableCell>
                        <TableCell>{assignment.membersCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="settings">
            <CardHeader>
              <CardTitle>Calendar settings</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-5 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Calendar name</Label>
                <Input defaultValue={calendar.name}/>
              </div>

              <div className="grid gap-2">
                <Label>Year</Label>
                <Input defaultValue={calendar.year}/>
              </div>

              <div className="grid gap-2">
                <Label>Country</Label>
                <Input defaultValue={calendar.country}/>
              </div>

              <div className="grid gap-2">
                <Label>Region</Label>
                <Input defaultValue={calendar.region ?? ""} placeholder="Optional"/>
              </div>

              <div className="grid gap-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea defaultValue={calendar.description} className="min-h-28 resize-none"/>
              </div>

              <div className="flex justify-end gap-3 md:col-span-2">
                <Button variant="outline">Cancel</Button>
                <Button>Save changes</Button>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
