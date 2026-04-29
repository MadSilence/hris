import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, } from "@/public/desact/src/components/ui/card";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-20">

      {/* HERO */}
      <section className="text-center flex flex-col items-center gap-6 py-10">
        <h1 className="text-5xl font-medium">
          HRIS your team will actually enjoy
        </h1>

        <p className="text-lg text-[var(--color-text-tertiary)] max-w-2xl">
          Centralize employee records, documents, time off and working
          hours—beautifully simple, tenant-ready, and fast.
        </p>

        <div className="flex gap-4">
          <Button asChild>
            <Link href="/contact">Request demo</Link>
          </Button>

          <Button asChild variant="secondary">
            <Link href="/products">See products</Link>
          </Button>
        </div>
      </section>

      {/* TRUST */}
      <section className="flex flex-col items-center gap-6">
        <p className="text-sm text-[var(--color-text-tertiary)]">
          Trusted by teams like
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          {["Acme", "Polar", "Nimbus", "Zento", "Volt"].map((name) => (
            <div
              key={name}
              className="px-4 py-2 border rounded-lg text-sm text-[var(--color-text-tertiary)]"
            >
              {name}
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Employee Records",
            body: "Single source of truth for profiles, docs, and lifecycle events—secure and searchable.",
            link: "/products#records",
          },
          {
            title: "Time Off",
            body: "Policies, approvals, accruals and carry-over, automated and audit-ready.",
            link: "/products#time-off",
          },
          {
            title: "Working Hours",
            body: "Lightweight timesheets and attendance with review and exports.",
            link: "/products#working-hours",
          },
        ].map((f) => (
          <Card key={f.title}>
            <CardHeader>
              <CardTitle>{f.title}</CardTitle>
            </CardHeader>

            <CardContent>
              <p>{f.body}</p>
            </CardContent>

            <CardFooter>
              <Link href={f.link} className="text-sm underline">
                Learn more →
              </Link>
            </CardFooter>
          </Card>
        ))}
      </section>

      {/* SOLUTIONS */}
      <section className="grid gap-6 md:grid-cols-2">
        {[
          {
            title: "For HR",
            body: "Cut admin by 40% with automation, templates, and clean workflows.",
            link: "/solutions#hr",
          },
          {
            title: "For People Managers",
            body: "Approvals, schedules, and team insights in one place.",
            link: "/solutions#people-managers",
          },
        ].map((s) => (
          <Card key={s.title}>
            <CardHeader>
              <CardTitle>{s.title}</CardTitle>
            </CardHeader>

            <CardContent>
              <p>{s.body}</p>
            </CardContent>

            <CardFooter>
              <Link href={s.link} className="text-sm underline">
                Explore →
              </Link>
            </CardFooter>
          </Card>
        ))}
      </section>

      {/* METRICS */}
      <section className="grid gap-6 md:grid-cols-3 text-center">
        {[
          ["40%", "less HR admin in month one"],
          ["99.9%", "uptime, audited"],
          ["7 days", "to go live on average"],
        ].map(([value, label]) => (
          <Card key={value}>
            <CardContent className="flex flex-col items-center gap-2">
              <div className="text-3xl font-semibold">{value}</div>
              <div className="text-sm text-[var(--color-text-tertiary)]">
                {label}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* HOW */}
      <section className="grid gap-6 md:grid-cols-3">
        {[
          { step: "1", title: "Connect", body: "Import employees and documents securely." },
          { step: "2", title: "Configure", body: "Set policies, roles, and approvals per tenant." },
          { step: "3", title: "Automate", body: "Use templates and reminders to reduce manual work." },
        ].map((h) => (
          <Card key={h.step}>
            <CardHeader>
              <CardTitle>
                {h.step}. {h.title}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p>{h.body}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* TESTIMONIAL */}
      <section>
        <Card>
          <CardContent className="flex flex-col gap-4">
            <blockquote className="italic text-lg">
              “SixSoftware is the first HR system our managers actually like using.”
            </blockquote>

            <div className="text-sm text-[var(--color-text-tertiary)]">
              — Marta Kowalska, People Ops, Nimbus
            </div>
          </CardContent>
        </Card>
      </section>

      {/* FAQ */}
      <section className="flex flex-col gap-6">
        <h2 className="text-3xl font-medium">FAQ</h2>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            ["Can we customize per tenant?", "Yes—branding, fields, and policies can be tenant-specific."],
            ["Do you support SSO?", "SAML/OIDC are available on Enterprise."],
            ["Where is data hosted?", "EU or US regions—your choice. Backups and encryption by default."],
          ].map(([title, body]) => (
            <Card key={title}>
              <CardHeader>
                <CardTitle>{title}</CardTitle>
              </CardHeader>

              <CardContent>
                <p>{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Ready to simplify HR?</CardTitle>
          </CardHeader>

          <CardContent>
            <p>Get a guided demo or start a trial with sample data.</p>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Button asChild>
              <Link href="/contact">Request demo</Link>
            </Button>

            <form className="flex gap-2 w-full md:w-auto">
              <Input name="work-email" placeholder="Work email" type="email"/>
              <Button variant="secondary">Subscribe</Button>
            </form>
          </CardFooter>
        </Card>
      </section>

    </div>
  );
}
