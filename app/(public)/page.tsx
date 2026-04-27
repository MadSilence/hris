import styles from "./home.module.css";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, } from "@/public/desact/src/components/ui/card";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";

export default function HomePage() {
  return (
    <div className={styles.wrap}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1>HRIS your team will actually enjoy</h1>
          <p className={styles.lead}>
            Centralize employee records, documents, time off and working
            hours—beautifully simple, tenant-ready, and fast.
          </p>
          <div className={styles.heroCtas}>
            <Button asChild>
              <Link href="/contact">Request demo</Link>
            </Button>

            <Button asChild variant="secondary">
              <Link href="/products">See products</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className={styles.trust}>
        <p className={styles.trustLabel}>Trusted by teams like</p>
        <div className={styles.trustLogos}>
          <span className={styles.logoBox}>Acme</span>
          <span className={styles.logoBox}>Polar</span>
          <span className={styles.logoBox}>Nimbus</span>
          <span className={styles.logoBox}>Zento</span>
          <span className={styles.logoBox}>Volt</span>
        </div>
      </section>

      <section className={styles.grid}>
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
              <Link href={f.link}>Learn more →</Link>
            </CardFooter>
          </Card>
        ))}
      </section>

      <section className={styles.gridTwo}>
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
              <Link href={s.link}>Explore →</Link>
            </CardFooter>
          </Card>
        ))}
      </section>

      <section className={styles.metrics}>
        <Card>
          <CardContent>
            <div>40%</div>
            <div>less HR admin in month one</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div>99.9%</div>
            <div>uptime, audited</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div>7 days</div>
            <div>to go live on average</div>
          </CardContent>
        </Card>
      </section>

      <section className={styles.how}>
        {[
          {
            step: "1",
            title: "Connect",
            body: "Import employees and documents securely.",
          },
          {
            step: "2",
            title: "Configure",
            body: "Set policies, roles, and approvals per tenant.",
          },
          {
            step: "3",
            title: "Automate",
            body: "Use templates and reminders to reduce manual work.",
          },
        ].map((h) => (
          <Card key={h.step}>
            <CardHeader>
              <CardTitle>{h.step}. {h.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{h.body}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className={styles.testimonial}>
        <Card>
          <CardContent>
            <blockquote>
              “SixSoftware is the first HR system our managers actually like
              using.”
            </blockquote>
            <div>— Marta Kowalska, People Ops, Nimbus</div>
          </CardContent>
        </Card>
      </section>

      <section className={styles.faq}>
        <h2>FAQ</h2>
        <div className={styles.faqGrid}>
          <Card>
            <CardHeader>
              <CardTitle>Can we customize per tenant?</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Yes—branding, fields, and policies can be tenant-specific.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Do you support SSO?</CardTitle>
            </CardHeader>
            <CardContent>
              <p>SAML/OIDC are available on Enterprise.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Where is data hosted?</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                EU or US regions—your choice. Backups and encryption by default.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className={styles.finalCta}>
        <Card>
          <CardHeader>
            <CardTitle>Ready to simplify HR?</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Get a guided demo or start a trial with sample data.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/contact">Request demo</Link>
            </Button>

            <form className={styles.newsletter}>
              <Input name="work-email" placeholder="Work email" type="email"/>
              <Button variant="secondary">Subscribe</Button>
            </form>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}
