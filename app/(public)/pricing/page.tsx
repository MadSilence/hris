import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, } from "@/components/desact/card";
import { Button } from "@/components/desact/button";

const TIERS = [
  { id: "starter", features: ["records", "timeOff", "basicReports"] },
  { id: "growth", features: ["everythingInStarter", "workingHours", "advancedReports"] },
  { id: "enterprise", features: ["customWorkflows", "slaSso", "dedicatedSupport"] },
] as const;

export default async function PricingPage() {
  const t = await getTranslations("navigation");
  return (
    <div className="flex flex-col gap-10">
      <section className="space-y-4">
        <h1 className="text-greeting">{t("public.pricing.title")}</h1>
        <p className="max-w-2xl text-section-title text-tertiary">
          {t("public.pricing.lead")}
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {TIERS.map((tier) => (
          <Card key={tier.id}>
            <CardHeader>
              <CardTitle>{t(`public.pricing.tiers.${tier.id}.name`)}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="text-page-title">{t(`public.pricing.tiers.${tier.id}.price`)}</div>

              <ul className="list-disc space-y-2 pl-5 text-body text-tertiary">
                {tier.features.map((f) => (
                  <li key={f}>{t(`public.pricing.features.${f}`)}</li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button type="button" className="w-full">{t(`public.pricing.tiers.${tier.id}.cta`)}</Button>
            </CardFooter>
          </Card>
        ))}
      </section>
    </div>
  );
}
