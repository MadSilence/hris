import { PersonalPreferencesForm } from "@/components/modules/firstRun/components/PersonalPreferencesForm";
import { NotificationPreferences } from "@/components/modules/notifications/components/NotificationPreferences";
import { PageDescription } from "@/components/ui/PageDescription/PageDescription";
import { DelegateApprovalsSection } from "@/components/modules/delegations/components";
import { MySessionsSection } from "@/components/modules/sessions/components";
import { TwoStepSection } from "@/components/modules/mfa/components";
import { ConnectIdentityProvider } from "@/components/modules/identity/components";
import { ssoService } from "@/api/modules/sso";
import { currentCompanySubdomain } from "@/api/modules/companyAddress";

export const metadata = { title: "My Preferences" };

/**
 * Everything a person sets about themselves, in one place.
 *
 * <p>The notification categories were already a screen of their own under the inbox, and the display
 * settings would have been a second one — two pages of "your own settings", found by two different
 * routes. `/inbox/preferences` now sends people here.
 */
type Props = { searchParams: Promise<{ sso?: string }> };

export default async function PreferencesPage({ searchParams }: Props) {
  const { sso: ssoResult } = await searchParams;
  const subdomain = await currentCompanySubdomain();
  const sso = subdomain ? await ssoService.publicSso(subdomain) : null;
  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">My Preferences</h1>
        <PageDescription className="text-base text-muted-foreground/90">
          How the product reads to you, who decides for you while you are away, what it tells you about, and
          where you are signed in.
        </PageDescription>
      </header>

      <section className="max-w-lg space-y-4">
        <h2 className="text-lg font-medium text-foreground">Dates and Time</h2>
        <PersonalPreferencesForm />
      </section>

      <section className="max-w-xl space-y-4">
        <h2 className="text-lg font-medium text-foreground">Delegate Approvals</h2>
        <DelegateApprovalsSection />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-foreground">Notifications</h2>
        <NotificationPreferences />
      </section>

      <section className="max-w-2xl space-y-4">
        <h2 className="text-lg font-medium text-foreground">Two-Step Sign-In</h2>
        <TwoStepSection />
      </section>

      {sso && sso.mode !== "OFF" && (
        <section className="max-w-2xl space-y-4">
          <h2 className="text-lg font-medium text-foreground">Single Sign-On</h2>
          <ConnectIdentityProvider provider={sso.provider} connected={ssoResult === "connected"} />
        </section>
      )}

      <section className="max-w-2xl space-y-4">
        <h2 className="text-lg font-medium text-foreground">Signed-in Sessions</h2>
        <MySessionsSection />
      </section>
    </div>
  );
}
