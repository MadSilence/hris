import { getTranslations } from "next-intl/server";
import { hrisApiSigningService } from "@/api/modules/signing/services";
import { PhoneDraw, PhoneEnd } from "@/components/modules/signing/components/SigningPages";

export async function generateMetadata() {
  const t = await getTranslations("signing");
  return { title: t("phone.title") };
}

type Props = { searchParams: Promise<{ token?: string }> };

/**
 * Where the QR code lands (documents-signing G03f–G03i): a phone with no session, holding a one-time token. Resolved
 * on the server, so a used or expired code says so before the pad opens.
 */
export default async function PhoneSignPage({ searchParams }: Props) {
  const { token } = await searchParams;
  if (!token) return <PhoneEnd expired />;
  try {
    const holder = await hrisApiSigningService.drawOpen(token);
    return <PhoneDraw token={token} title={holder.title} signerName={holder.signerName} />;
  } catch {
    return <PhoneEnd expired />;
  }
}
