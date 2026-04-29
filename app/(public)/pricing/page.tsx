import { Card, CardContent, CardFooter, CardHeader, CardTitle, } from "@/public/desact/src/components/ui/card";
import { Button } from "@/public/desact/src/components/ui/button";

const tiers = [
  {
    name: "Starter",
    price: "€3 / employee / mo",
    features: ["Employee records", "Time off", "Basic reports"],
    cta: "Get started",
  },
  {
    name: "Growth",
    price: "€5 / employee / mo",
    features: ["Everything in Starter", "Working hours", "Advanced reports"],
    cta: "Start trial",
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: ["Custom workflows", "SLA & SSO", "Dedicated support"],
    cta: "Talk to sales",
  },
];

export default function PricingPage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="space-y-4">
        <h1 className="text-5xl font-medium">Pricing</h1>
        <p className="max-w-2xl text-lg text-[var(--color-text-tertiary)]">
          Simple, transparent pricing that scales with your team.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {tiers.map((t) => (
          <Card key={t.name}>
            <CardHeader>
              <CardTitle>{t.name}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="text-2xl font-semibold">{t.price}</div>

              <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--color-text-tertiary)]">
                {t.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button className="w-full">{t.cta}</Button>
            </CardFooter>
          </Card>
        ))}
      </section>
    </div>
  );
}
