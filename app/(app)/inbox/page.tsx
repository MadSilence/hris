import { Card, CardContent, CardHeader, CardTitle, } from "@/public/desact/src/components/ui/card";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Button } from "@/public/desact/src/components/ui/button";
import { Bell, CheckCircle, Clock, FileText, MessageSquare, ShieldAlert, } from "lucide-react";

const notifications = [
  {
    title: "Time off request awaiting approval",
    message: "Marta Nowak requested 3 days off next week.",
    time: "5 min ago",
    type: "Approval",
    unread: true,
    icon: Clock,
  },
  {
    title: "Document signed",
    message: "Employment agreement was signed by Adam Zielinski.",
    time: "24 min ago",
    type: "Document",
    unread: true,
    icon: FileText,
  },
  {
    title: "Role permissions changed",
    message: "People Manager role received updated field permissions.",
    time: "1 hour ago",
    type: "Security",
    unread: false,
    icon: ShieldAlert,
  },
  {
    title: "Profile completed",
    message: "Julia Smith completed all onboarding fields.",
    time: "Today",
    type: "People",
    unread: false,
    icon: CheckCircle,
  },
];

export default function InboxPage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">

          <h1 className="text-3xl font-semibold">Inbox</h1>

          <p className="max-w-2xl text-[var(--color-text-tertiary)]">
            Track approvals, system events, document updates and HR tasks in one
            shared inbox.
          </p>
        </div>

        <Button variant="secondary">Mark all as read</Button>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["8", "Unread"],
          ["14", "Approvals"],
          ["6", "Documents"],
          ["21", "System events"],
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

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5"/>
              Recent notifications
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">
            {notifications.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className={`flex gap-4 rounded-lg border p-4 ${
                    item.unread ? "bg-brown-50" : ""
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                    <Icon className="h-5 w-5 text-brown-600"/>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{item.title}</p>
                      <Badge variant="secondary">{item.type}</Badge>
                      {item.unread && (
                        <span className="h-2 w-2 rounded-full bg-brown-600"/>
                      )}
                    </div>

                    <p className="text-sm text-[var(--color-text-tertiary)]">
                      {item.message}
                    </p>

                    <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                      {item.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inbox categories</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">
            {[
              ["Approvals", "14"],
              ["Mentions", "3"],
              ["Documents", "6"],
              ["Security", "2"],
              ["System", "21"],
            ].map(([label, count]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-brown-600"/>
                  <span>{label}</span>
                </div>

                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
