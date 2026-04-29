import { Card, CardContent, CardHeader, CardTitle, } from "@/public/desact/src/components/ui/card";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { ArrowRight, CalendarDays, FileText, Search, ShieldCheck, Users, } from "lucide-react";

const results = [
  {
    title: "Anna Kowalska",
    type: "Employee",
    description: "People · Engineering · Frontend Developer",
    icon: Users,
  },
  {
    title: "Remote Work Policy",
    type: "Document",
    description: "Company policies · Updated recently",
    icon: FileText,
  },
  {
    title: "People Manager",
    type: "Role",
    description: "Permissions · 14 assigned users",
    icon: ShieldCheck,
  },
  {
    title: "Summer Vacation Calendar",
    type: "Time off",
    description: "Team availability · July overview",
    icon: CalendarDays,
  },
];

export default function SearchPage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-2">

        <h1 className="text-3xl font-semibold">Search across HRIS</h1>

        <p className="max-w-2xl text-[var(--color-text-tertiary)]">
          Find employees, roles, documents, policies, requests and company data
          from one place.
        </p>
      </section>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]"/>
            <Input
              className="pl-10"
              placeholder="Search people, documents, roles, policies..."
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {["People", "Documents", "Roles", "Requests", "Time off"].map(
              (item) => (
                <Badge key={item} variant="secondary">
                  {item}
                </Badge>
              )
            )}
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Suggested results</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">
            {results.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brown-50">
                    <Icon className="h-5 w-5 text-brown-600"/>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.title}</p>
                      <Badge variant="secondary">{item.type}</Badge>
                    </div>

                    <p className="text-sm text-[var(--color-text-tertiary)]">
                      {item.description}
                    </p>
                  </div>

                  <Button variant="ghost" size="sm">
                    <ArrowRight className="h-4 w-4"/>
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Search insights</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            {[
              ["Recent searches", "12"],
              ["Indexed employees", "128"],
              ["Indexed documents", "342"],
              ["Saved filters", "5"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0"
              >
                <span>{label}</span>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
