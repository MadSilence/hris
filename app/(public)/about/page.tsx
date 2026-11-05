import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/desact/card";

const VALUES = ["clarity", "time", "privacy"] as const;

export default async function AboutPage() {
  const t = await getTranslations("navigation");
  return (
    <div className="flex flex-col gap-10">
      <section className="space-y-4">
        <h1 className="text-greeting">{t("public.about.title")}</h1>
        <p className="max-w-2xl text-section-title text-tertiary">
          {t("public.about.lead")}
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("public.about.story.title")}</CardTitle>
          </CardHeader>

          <CardContent>
            <p>
              {t("public.about.story.body")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("public.about.values.title")}</CardTitle>
          </CardHeader>

          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-body text-tertiary">
              {VALUES.map((id) => (
                <li key={id}>{t(`public.about.values.${id}`)}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
