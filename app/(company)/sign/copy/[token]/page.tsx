import { getTranslations } from "next-intl/server";
import { companyAuthBrand } from "@/api/modules/companyAddress";
import { SignedCopy } from "@/components/modules/signing/components/SigningPages";

export async function generateMetadata() {
  const t = await getTranslations("signing");
  return { title: t("copy.title") };
}

type Props = { params: Promise<{ token: string }> };

/** A guest's signed copy (documents-signing G12): the link from "Everyone has signed", thirty days. */
export default async function SignedCopyPage({ params }: Props) {
  const { token } = await params;
  const { brand } = await companyAuthBrand();
  return (
    <SignedCopy
      token={token}
      company={brand.kind === "company" ? brand.name : null}
      logoUrl={brand.kind === "company" ? brand.logoUrl : null}
    />
  );
}
