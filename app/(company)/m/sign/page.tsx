import { getTranslations } from "next-intl/server";
import { hrisApiSigningService } from "@/api/modules/signing/services";
import { companyAuthBrand } from "@/api/modules/companyAddress";
import { PhoneDraw, PhoneEnd } from "@/components/modules/signing/components/SigningPages";

export async function generateMetadata() {
  const t = await getTranslations("signing");
  return { title: t("phone.title") };
}

type Props = { searchParams: Promise<{ token?: string }> };

/**
 * Where the QR code lands (documents-signing G03f–G03i): a phone with no session, holding a one-time token. Resolved
 * on the server, so a used or expired code says so before the pad opens. The band wears the company's logo and name
 * (G8) — the host is the company's, so its look is read the way the login reads it.
 */
export default async function PhoneSignPage({ searchParams }: Props) {
  const { token } = await searchParams;
  const { brand: look } = await companyAuthBrand();
  const brand = {
    companyName: look.kind === "company" ? look.name : null,
    logoUrl: look.kind === "company" ? look.logoUrl : null,
  };
  if (!token) return <PhoneEnd expired brand={brand} />;
  try {
    const holder = await hrisApiSigningService.drawOpen(token);
    return (
      <PhoneDraw
        token={token}
        title={holder.title}
        signerName={holder.signerName}
        brand={{ ...brand, companyName: holder.companyName ?? brand.companyName }}
      />
    );
  } catch {
    return <PhoneEnd expired brand={brand} />;
  }
}
