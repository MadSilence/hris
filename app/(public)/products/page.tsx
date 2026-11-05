import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, } from "@/components/desact/card";
import { Button } from "@/components/desact/button";

/** `id` is the page anchor the landing page links to; `key` names the product in the catalogue. */
const PRODUCTS = [
  { id: "records", key: "records" },
  { id: "time-off", key: "timeOff" },
  { id: "working-hours", key: "workingHours" },
] as const;

export default async function ProductsPage() {
  const t = await getTranslations("navigation");
  return (
    <div className="flex flex-col gap-10">
      <section className="space-y-4">
        <h1 className="text-greeting">{t("public.products.title")}</h1>
        <p className="max-w-2xl text-section-title text-tertiary">
          {t("public.products.lead")}
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {PRODUCTS.map((p) => (
          <Card key={p.id} id={p.id}>
            <CardHeader>
              <CardTitle>{t(`public.products.items.${p.key}.title`)}</CardTitle>
            </CardHeader>

            <CardContent>
              <p>{t(`public.products.items.${p.key}.body`)}</p>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 sm:flex-row">
              <Button type="button">{t("public.home.requestDemo")}</Button>
              <Button type="button" variant="secondary">{t("public.products.learnMore")}</Button>
            </CardFooter>
          </Card>
        ))}
      </section>
    </div>
  );
}
