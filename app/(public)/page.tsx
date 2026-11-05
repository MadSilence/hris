import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, } from "@/components/desact/card";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";

const FEATURES = [
  { id: "records", link: "/products#records" },
  { id: "timeOff", link: "/products#time-off" },
  { id: "workingHours", link: "/products#working-hours" },
] as const;

const SOLUTIONS = [
  { id: "hr", link: "/solutions#hr" },
  { id: "managers", link: "/solutions#people-managers" },
] as const;

const METRICS = ["admin", "uptime", "goLive"] as const;

const STEPS = ["connect", "configure", "automate"] as const;

const FAQ = ["tenant", "sso", "hosting"] as const;

export default async function HomePage() {
  const t = await getTranslations("navigation");
  return (
    <div className="flex flex-col gap-20">

      {/* HERO */}
      <section className="text-center flex flex-col items-center gap-6 py-10">
        <h1 className="text-greeting">
          {t("public.home.hero.title")}
        </h1>

        <p className="text-section-title text-tertiary max-w-2xl">
          {t("public.home.hero.lead")}
        </p>

        <div className="flex gap-4">
          <Button asChild>
            <Link href="/contact">{t("public.home.requestDemo")}</Link>
          </Button>

          <Button asChild variant="secondary">
            <Link href="/products">{t("public.home.hero.seeProducts")}</Link>
          </Button>
        </div>
      </section>

      {/* TRUST */}
      <section className="flex flex-col items-center gap-6">
        <p className="text-body text-tertiary">
          {t("public.home.trustedBy")}
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          {["Acme", "Polar", "Nimbus", "Zento", "Volt"].map((name) => (
            <div
              key={name}
              className="px-4 py-2 border rounded-card text-body text-tertiary"
            >
              {name}
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="grid gap-6 md:grid-cols-3">
        {FEATURES.map((f) => (
          <Card key={f.id}>
            <CardHeader>
              <CardTitle>{t(`public.home.features.${f.id}.title`)}</CardTitle>
            </CardHeader>

            <CardContent>
              <p>{t(`public.home.features.${f.id}.body`)}</p>
            </CardContent>

            <CardFooter>
              <Link href={f.link} className="text-body text-accent-text underline-offset-4 hover:underline">
                {t("public.home.learnMoreArrow")}
              </Link>
            </CardFooter>
          </Card>
        ))}
      </section>

      {/* SOLUTIONS */}
      <section className="grid gap-6 md:grid-cols-2">
        {SOLUTIONS.map((s) => (
          <Card key={s.id}>
            <CardHeader>
              <CardTitle>{t(`public.home.solutions.${s.id}.title`)}</CardTitle>
            </CardHeader>

            <CardContent>
              <p>{t(`public.home.solutions.${s.id}.body`)}</p>
            </CardContent>

            <CardFooter>
              <Link href={s.link} className="text-body text-accent-text underline-offset-4 hover:underline">
                {t("public.home.exploreArrow")}
              </Link>
            </CardFooter>
          </Card>
        ))}
      </section>

      {/* METRICS */}
      <section className="grid gap-6 md:grid-cols-3 text-center">
        {METRICS.map((id) => (
          <Card key={id}>
            <CardContent className="flex flex-col items-center gap-2">
              <div className="text-page-title">{t(`public.home.metrics.${id}.value`)}</div>
              <div className="text-body text-tertiary">
                {t(`public.home.metrics.${id}.label`)}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* HOW */}
      <section className="grid gap-6 md:grid-cols-3">
        {STEPS.map((id, index) => (
          <Card key={id}>
            <CardHeader>
              <CardTitle>
                {t("public.home.steps.numbered", { step: index + 1, title: t(`public.home.steps.${id}.title`) })}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p>{t(`public.home.steps.${id}.body`)}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* TESTIMONIAL */}
      <section>
        <Card>
          <CardContent className="flex flex-col gap-4">
            <blockquote className="text-section-title">
              {t("public.home.testimonial.quote")}
            </blockquote>

            <div className="text-body text-tertiary">
              {t("public.home.testimonial.author")}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* FAQ */}
      <section className="flex flex-col gap-6">
        <h2 className="text-page-title">{t("public.home.faq.title")}</h2>

        <div className="grid gap-6 md:grid-cols-3">
          {FAQ.map((id) => (
            <Card key={id}>
              <CardHeader>
                <CardTitle>{t(`public.home.faq.${id}.question`)}</CardTitle>
              </CardHeader>

              <CardContent>
                <p>{t(`public.home.faq.${id}.answer`)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>{t("public.home.cta.title")}</CardTitle>
          </CardHeader>

          <CardContent>
            <p>{t("public.home.cta.body")}</p>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Button asChild>
              <Link href="/contact">{t("public.home.requestDemo")}</Link>
            </Button>

            <form className="flex gap-2 w-full md:w-auto">
              <Input name="work-email" placeholder={t("public.home.cta.emailPlaceholder")} type="email"/>
              <Button type="button" variant="secondary">{t("public.home.cta.subscribe")}</Button>
            </form>
          </CardFooter>
        </Card>
      </section>

    </div>
  );
}
