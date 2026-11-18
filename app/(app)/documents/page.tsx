import { getTranslations } from "next-intl/server";
import { DocumentsSection } from "@/components/modules/signing/components/DocumentsSection";

export async function generateMetadata() {
  const t = await getTranslations("signing");
  return { title: t("section.title") };
}

type Props = { searchParams: Promise<{ view?: string }> };

const VIEWS = ["all", "expiring", "signing", "requests"] as const;

/** The Documents item (documents-section): everyone's documents the reader may see, in four views. */
export default async function DocumentsPage({ searchParams }: Props) {
  const { view } = await searchParams;
  const initial = (VIEWS as readonly string[]).includes(view ?? "") ? (view as (typeof VIEWS)[number]) : "all";
  return <DocumentsSection initialView={initial} />;
}
