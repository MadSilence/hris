import { Card, CardContent, CardHeader, CardTitle, } from "@/public/desact/src/components/ui/card";

const solutions = [
  {
    id: "hr",
    title: "HR Teams",
    body: "Automate admin and standardize processes without losing flexibility.",
    bullets: ["Templates & reminders", "Document workflows", "Reports & exports"],
  },
  {
    id: "people-managers",
    title: "People Managers",
    body: "Approve requests, view balances, and keep schedules in sync.",
    bullets: ["Approvals in one view", "Team calendars", "Manager insights"],
  },
  {
    id: "finance",
    title: "Finance",
    body: "Reliable time data and leave balances ready for payroll.",
    bullets: ["Timesheet exports", "Accrual rules", "Audit log"],
  },
];

export default function SolutionsPage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="space-y-4">
        <h1 className="text-5xl font-medium">Solutions</h1>
        <p className="max-w-2xl text-lg text-[var(--color-text-tertiary)]">
          Role-based value across your organization.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {solutions.map((s) => (
          <Card key={s.id} id={s.id}>
            <CardHeader>
              <CardTitle>{s.title}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <p>{s.body}</p>

              <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--color-text-tertiary)]">
                {s.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
