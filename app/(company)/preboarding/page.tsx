import { getTranslations } from "next-intl/server";
import { hrisApiLifecycleService } from "@/api/modules/lifecycle/services";
import type { PreboardingPage } from "@/models/lifecycle";
import { PreboardingPageContainer } from "@/components/modules/lifecycle/preboarding/PreboardingPageContainer";
import { messageForError } from "@/lib/errors/errorMessages";
import { currentCompanySubdomain, publicAppearanceFor } from "@/api/modules/companyAddress";
import { PoweredByNoddo } from "@/components/brand";
import { Illustration } from "@/components/illustrations/Illustration";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

/**
 * Where a preboarding link lands. No account and no session: the token is the credential, and the
 * page is resolved on the server so a link that no longer works says so instead of rendering a form.
 *
 * The company's page, not noddo's (SPEC § 2): its logo at the top, its colour on every action, noddo only as
 * "powered by noddo" at the foot. Built for a phone first — a joiner opens it from an email.
 */
export const dynamic = "force-dynamic";
export default async function PreboardingRoutePage({ searchParams }: Props) {
  const { token } = await searchParams;
  const t = await getTranslations("lifecycle");

  let page: PreboardingPage | null = null;
  let problem: string | null = null;
  if (!token) {
    problem = t("preboarding.linkIncomplete");
  } else {
    try {
      page = await hrisApiLifecycleService.preboardingView(token);
    } catch (error) {
      problem = messageForError(error);
    }
  }

  const subdomain = await currentCompanySubdomain();
  const logoUrl = subdomain ? (await publicAppearanceFor(subdomain)).logoUrl : null;

  return (
    <div className="flex min-h-screen flex-col bg-page">
      {logoUrl && (
        <header className="mx-auto flex w-full max-w-2xl px-4 pt-6 sm:px-6">
          {/* Backend-hosted upload of unknown dimensions; next/image would need a remote pattern for the API origin. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} alt="" className="block max-h-8 max-w-40 object-contain" />
        </header>
      )}

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 sm:px-6">
        {!token || !page ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
            <Illustration scene="policies" />
            <h1 className="text-page-title">{t("preboarding.linkBroken")}</h1>
            <p className="text-body text-secondary">{problem}</p>
            <p className="text-body text-secondary">{t("preboarding.signInHint")}</p>
          </div>
        ) : (
          <PreboardingPageContainer token={token} initialPage={page} />
        )}
      </main>

      <footer className="flex justify-center py-6">
        <PoweredByNoddo />
      </footer>
    </div>
  );
}
