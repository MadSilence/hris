import { getTranslations } from "next-intl/server";
import { hrisApiSigningService } from "@/api/modules/signing/services";
import { SigningScreen } from "@/components/modules/signing/components/SigningScreen";
import { ErrorState } from "@/components/feedback/ErrorState";

export async function generateMetadata() {
  const t = await getTranslations("signing");
  return { title: t("screen.sign") };
}

type Props = { params: Promise<{ id: string }> };

/**
 * The signing screen for a person in the company (documents-signing G02–G08): opened from Home's "Do" card, the inbox
 * or the email. A full page over the app with its own top bar; read on the server, so a closed signing says so first.
 */
export default async function SignDocumentPage({ params }: Props) {
  const { id } = await params;
  const t = await getTranslations("signing");
  try {
    const envelope = await hrisApiSigningService.forSigner(id);
    return (
      <SigningScreen
        party={{ kind: "member", envelopeId: id }}
        envelope={envelope}
        youSignerId={envelope.youSignerId ?? null}
        senderName={envelope.sentByName ?? ""}
        backHref="/dashboard"
        backLabel={t("signed.home")}
      />
    );
  } catch (error) {
    return <ErrorState error={error} />;
  }
}
