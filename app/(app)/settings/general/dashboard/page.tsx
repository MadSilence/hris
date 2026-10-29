import { FC } from "react";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import { PageGate } from "@/components/auth/PageGate";
import { BirthdayField } from "@/components/modules/settings/modules/general/home";

/**
 * Settings → General → Home: what the company decides about everybody's home. Today that is one thing, the
 * field birthdays come from (sitting 2, H7); how each person arranges their own home is theirs, on home itself.
 * The route keeps its old name — it was the "Dashboard" placeholder, and home itself still lives at `/dashboard`.
 */
const HomeSettingsPage: FC = () => (
  <PageGate resource="SETTINGS.GENERAL" action="VIEW">
    <div className="space-y-6">
      <div className="px-8 space-y-4">
        <SettingsPageHeader title="Home" backHref="/settings"/>

        <PageDescription className="text-base text-muted-foreground/90">
          What everybody&apos;s home can show. Each person chooses and arranges their own widgets; the company
          decides where the data behind them comes from.
        </PageDescription>
      </div>

      <div className="space-y-10 px-8">
        <BirthdayField/>
      </div>
    </div>
  </PageGate>
);

export default HomeSettingsPage;
