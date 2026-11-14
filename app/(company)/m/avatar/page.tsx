import { getTranslations } from "next-intl/server";
import { MobileAvatarUpload } from "@/components/modules/firstRun/components/MobileAvatarUpload";
import { WelcomeFrame } from "@/components/modules/firstRun/components/FirstRunPieces";
import { hrisFirstRunService } from "@/api/modules/firstRun/services";
import { companyAuthBrand } from "@/api/modules/companyAddress";

export async function generateMetadata() {
  const t = await getTranslations("firstRun");
  return { title: t("mobileAvatar.title") };
}

type Props = { searchParams: Promise<{ token?: string }> };

/**
 * Where the code lands (first-run-photo P6–P10): a phone with no session, holding a one-time token, in the welcome's
 * white frame — the company's logo on top, its rings along the bottom.
 *
 * <p>Resolved on the server so a code that has expired or already been used says so (P10) before the gallery opens,
 * rather than offering a button that will fail after the photo is picked.
 */
export default async function MobileAvatarPage({ searchParams }: Props) {
  const t = await getTranslations("firstRun");
  const { token } = await searchParams;
  const { brand } = await companyAuthBrand();
  const company = brand.kind === "company" ? { name: brand.name, logoUrl: brand.logoUrl ?? null } : { name: "", logoUrl: null };

  let person: { firstName: string | null; lastName: string | null } | null = null;
  if (token) {
    try {
      person = await hrisFirstRunService.resolveAvatarUploadToken(token);
    } catch {
      // Expired, already used, or never existed — one answer, because the holder cannot act
      // differently on the difference and telling them apart says whose link it was.
      person = null;
    }
  }

  return (
    <WelcomeFrame company={company}>
      {!token || !person ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-auth-title text-primary">{t("mobileAvatar.expired.title")}</h1>
          <p className="text-auth-lead text-secondary">{t("mobileAvatar.expired.body")}</p>
        </div>
      ) : (
        <MobileAvatarUpload token={token} firstName={person.firstName} lastName={person.lastName} company={company.name} />
      )}
    </WelcomeFrame>
  );
}
