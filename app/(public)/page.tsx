import styles from "./home.module.css";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";

export default function HomePage() {
  return (
    <div className={styles.wrap}>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1>HRIS your team will actually enjoy</h1>
          <p className={styles.lead}>
            Centralize employee records, documents, time off and working hours—beautifully simple,
            tenant-ready, and fast.
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

      {/* TRUST */}
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

      {/* PRODUCT HIGHLIGHTS */}
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
          <Card key={f.title} className={styles.card}>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
            <Link href={f.link} className={styles.cardLink}>
              Learn more →
            </Link>
          </Card>
        ))}
      </section>

      {/* SOLUTIONS BY AUDIENCE */}
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
          <Card key={s.title} className={styles.card}>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
            <Link href={s.link} className={styles.cardLink}>
              Explore →
            </Link>
          </Card>
        ))}
      </section>

      {/* METRICS / PROOF */}
      <section className={styles.metrics}>
        <Card className={styles.metricCard}>
          <div className={styles.metricValue}>40%</div>
          <div className={styles.metricLabel}>less HR admin in month one</div>
        </Card>
        <Card className={styles.metricCard}>
          <div className={styles.metricValue}>99.9%</div>
          <div className={styles.metricLabel}>uptime, audited</div>
        </Card>
        <Card className={styles.metricCard}>
          <div className={styles.metricValue}>7 days</div>
          <div className={styles.metricLabel}>to go live on average</div>
        </Card>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.how}>
        {[
          { step: "1", title: "Connect", body: "Import employees and documents securely." },
          { step: "2", title: "Configure", body: "Set policies, roles, and approvals per tenant." },
          { step: "3", title: "Automate", body: "Use templates and reminders to reduce manual work." },
        ].map((h) => (
          <Card key={h.step} className={styles.howCard}>
            <div className={styles.step}>{h.step}</div>
            <h4>{h.title}</h4>
            <p>{h.body}</p>
          </Card>
        ))}
      </section>

      {/* TESTIMONIAL */}
      <section className={styles.testimonial}>
        <Card className={styles.testimonialCard}>
          <blockquote>“SixSoftware is the first HR system our managers actually like using.”</blockquote>
          <div className={styles.attribution}>— Marta Kowalska, People Ops, Nimbus</div>
        </Card>
      </section>

      {/* FAQ */}
      <section className={styles.faq}>
        <h2>FAQ</h2>
        <div className={styles.faqGrid}>
          <Card className={styles.faqItem}>
            <h4>Can we customize per tenant?</h4>
            <p>Yes—branding, fields, and policies can be tenant-specific.</p>
          </Card>
          <Card className={styles.faqItem}>
            <h4>Do you support SSO?</h4>
            <p>SAML/OIDC are available on Enterprise.</p>
          </Card>
          <Card className={styles.faqItem}>
            <h4>Where is data hosted?</h4>
            <p>EU or US regions—your choice. Backups and encryption by default.</p>
          </Card>
        </div>
      </section>

      {/* FINAL CTA / NEWSLETTER */}
      <section className={styles.finalCta}>
        <Card className={styles.finalCard}>
          <div className={styles.finalCopy}>
            <h3>Ready to simplify HR?</h3>
            <p>Get a guided demo or start a trial with sample data.</p>
          </div>
          <div className={styles.finalActions}>
            <Button asChild>
              <Link href="/contact">Request demo</Link>
            </Button>
            <form className={styles.newsletter}>
              <Input name="work-email" placeholder="Work email" type="email"/>
              <Button variant="secondary">Subscribe</Button>
            </form>
          </div>
        </Card>
      </section>
    </div>
  );
}
