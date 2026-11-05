import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/desact/card";

/** `id` is the page anchor the landing page links to; `key` names the solution in the catalogue. */
const SOLUTIONS = [
  { id: "hr", key: "hr" },
  { id: "people-managers", key: "managers" },
  { id: "finance", key: "finance" },
] as const;

const BULLETS = ["first", "second", "third"] as const;

export default async function SolutionsPage() {
  const t = await getTranslations("navigation");
  return (
    <div className="flex flex-col gap-10">
      <section className="space-y-4">
        <h1 className="text-greeting">{t("public.solutions.title")}</h1>
        <p className="max-w-2xl text-section-title text-tertiary">
          {t("public.solutions.lead")}
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {SOLUTIONS.map((s) => (
          <Card key={s.id} id={s.id}>
            <CardHeader>
              <CardTitle>{t(`public.solutions.items.${s.key}.title`)}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <p>{t(`public.solutions.items.${s.key}.body`)}</p>

              <ul className="list-disc space-y-2 pl-5 text-body text-tertiary">
                {BULLETS.map((b) => (
                  <li key={b}>{t(`public.solutions.items.${s.key}.bullets.${b}`)}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
