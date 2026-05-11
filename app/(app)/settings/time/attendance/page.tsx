import { Card, CardContent, CardHeader, CardTitle, } from "@/public/desact/src/components/ui/card";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Button } from "@/public/desact/src/components/ui/button";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Plane, Plus, Users, } from "lucide-react";

const days = Array.from({ length: 35 }, (_, index) => index + 1);

const requests = [
  {
    name: "Anna Kowalska",
    dates: "May 6–8",
    type: "Vacation",
    status: "Pending",
  },
  {
    name: "David Kim",
    dates: "May 12",
    type: "Sick leave",
    status: "Approved",
  },
  {
    name: "Emily Davis",
    dates: "May 20–24",
    type: "Vacation",
    status: "Pending",
  },
];

export default function TimeOffPage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">

          <h1 className="text-3xl font-semibold">Time off</h1>

          <p className="max-w-2xl text-[var(--color-text-tertiary)]">
            Review requests, track team availability and manage company leave
            calendars.
          </p>
        </div>

        <Button>
          <Plus className="mr-2 h-4 w-4"/>
          Request time off
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["18", "Pending requests"],
          ["42", "Approved days"],
          ["7", "People away"],
          ["93%", "Policy coverage"],
        ].map(([value, label]) => (
          <Card key={label}>
            <CardContent className="flex flex-col gap-2 pt-8">
              <div className="text-3xl font-semibold">{value}</div>
              <div className="text-sm text-[var(--color-text-tertiary)]">
                {label}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5"/>
                Team calendar
              </CardTitle>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <ChevronLeft className="h-4 w-4"/>
                </Button>

                <span className="text-sm font-medium">May 2026</span>

                <Button variant="outline" size="sm">
                  <ChevronRight className="h-4 w-4"/>
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">
            <div className="grid grid-cols-7 gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-xs font-medium text-[var(--color-text-tertiary)]"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days.map((day) => {
                const hasEvent = [6, 7, 8, 12, 20, 21, 22, 23, 24].includes(
                  day
                );

                return (
                  <div
                    key={day}
                    className="min-h-[72px] rounded-lg border bg-white p-2"
                  >
                    <div className="mb-2 text-sm font-medium">{day}</div>

                    {hasEvent && (
                      <div className="space-y-1">
                        <div className="h-1.5 rounded-full bg-brown-500"/>
                        <div className="h-1.5 w-2/3 rounded-full bg-brown-200"/>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requests</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">
            {requests.map((request) => (
              <div key={request.name} className="rounded-lg border p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{request.name}</p>
                    <p className="text-sm text-[var(--color-text-tertiary)]">
                      {request.dates}
                    </p>
                  </div>

                  <Badge variant="secondary">{request.status}</Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-[var(--color-text-tertiary)]">
                  <Plane className="h-4 w-4"/>
                  {request.type}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Leave policies",
            body: "Configure vacation, sick leave and custom absence types.",
            icon: Clock,
          },
          {
            title: "Team availability",
            body: "See overlapping absences and staffing coverage.",
            icon: Users,
          },
          {
            title: "Calendar sync",
            body: "Connect approved absences with company calendars.",
            icon: CalendarDays,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-brown-600"/>
                  {item.title}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-[var(--color-text-tertiary)]">
                  {item.body}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
