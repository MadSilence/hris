import { getTranslations } from "next-intl/server";
import { hrisApiSigningService } from "@/api/modules/signing/services";
import { companyAuthBrand } from "@/api/modules/companyAddress";
import { SigningScreen } from "@/components/modules/signing/components/SigningScreen";
import { DeadLink } from "@/components/modules/signing/components/SigningPages";

export async function generateMetadata() {
  const t = await getTranslations("signing");
  return { title: t("screen.sign") };
}

type Props = { params: Promise<{ token: string }> };

/**
 * A guest's signing page (documents-signing G09–G11, G13): the link from their email, no login, in the company's colour
 * and name, "Signing powered by noddo" at the foot. Other signers' emails are never shown — the backend leaves them out.
 * A dead link (G10) says so in the login's words.
 */
export default async function GuestSignPage({ params }: Props) {
  const { token } = await params;
  const { brand } = await companyAuthBrand();
  const companyName = brand.kind === "company" ? brand.name : null;
  try {
    const view = await hrisApiSigningService.guestView(token);
    return (
      <SigningScreen
        party={{ kind: "guest", token }}
        envelope={view.envelope}
        youSignerId={view.signerId}
        senderName={view.envelope.sentByName ?? view.companyName ?? companyName ?? ""}
        backHref={null}
        backLabel=""
        brand={{ companyName: view.companyName ?? companyName }}
      />
    );
  } catch {
    return <DeadLink company={companyName} />;
  }
}
