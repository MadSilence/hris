import { getTranslations } from "next-intl/server";
import { hrisApiSigningService } from "@/api/modules/signing/services";
import { companyAuthBrand } from "@/api/modules/companyAddress";
import { SigningScreen } from "@/components/modules/signing/components/SigningScreen";
import { DeadLink } from "@/components/modules/signing/components/SigningPages";

export async function generateMetadata() {
  const t = await getTranslations("signing");
  return { title: t("screen.sign") };
}

type Props = { params: Promise<{ taskId: string }>; searchParams: Promise<{ token?: string }> };

/**
 * A new joiner signs (documents-signing P08): the same screen as a guest's, opened from their preboarding page with its
 * token. The code goes to their personal email; "Back to your tasks" returns to the page.
 */
export default async function JoinerSignPage({ params, searchParams }: Props) {
  const { taskId } = await params;
  const { token } = await searchParams;
  const t = await getTranslations("signing");
  const { brand } = await companyAuthBrand();
  const companyName = brand.kind === "company" ? brand.name : null;
  if (!token) return <DeadLink company={companyName} />;
  try {
    const envelope = await hrisApiSigningService.joinerView(token, taskId);
    return (
      <SigningScreen
        party={{ kind: "joiner", token, taskId }}
        envelope={envelope}
        youSignerId={envelope.youSignerId ?? null}
        senderName={envelope.sentByName ?? companyName ?? ""}
        backHref={`/preboarding?token=${encodeURIComponent(token)}`}
        backLabel={t("signed.tasks")}
        brand={{ companyName }}
      />
    );
  } catch {
    return <DeadLink company={companyName} />;
  }
}
